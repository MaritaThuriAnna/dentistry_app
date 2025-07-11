import os
import cv2
import numpy as np
from PIL import Image, ImageDraw
import torch
import torchvision.transforms as transforms
import segmentation_models_pytorch as smp
import io
import base64
from ultralytics import YOLO

tooth_name_mapping = {
    0: "Upper right 3rd molar",
    1: "Upper right 2nd molar",
    2: "Upper right 1st molar",
    3: "Upper right 2nd premolar",
    4: "Upper right 1st premolar",
    5: "Upper right canine",
    6: "Upper right lateral incisor",
    7: "Upper right central incisor",

    8: "Upper left central incisor",
    9: "Upper left lateral incisor",
    10: "Upper left canine",
    11: "Upper left 1st premolar",
    12: "Upper left 2nd premolar",
    13: "Upper left 1st molar",
    14: "Upper left 2nd molar",
    15: "Upper left Third Molar",

    16: "Lower left 3rd molar",
    17: "Lower left 2nd molar",
    18: "Lower left 1st molar",
    19: "Lower left 2nd premolar",
    20: "Lower left 1st premolar",
    21: "Lower left canine",
    22: "Lower left lateral incisor",
    23: "Lower left central incisor",

    24: "Lower right central incisor",
    25: "Lower right lateral incisor",
    26: "Lower right canine",
    27: "Lower right 1st premolar",
    28: "Lower right 2nd premolar",
    29: "Lower right 1st molar",
    30: "Lower right 2nd molar",
    31: "Lower right 3rd molar"
}

def segment_caries(image, model_path = '/app/models/best_model4.pth', threshold = 0.05, crop = True):
    DEVICE = 'cpu'

    model = smp.UnetPlusPlus(
        encoder_name = "efficientnet-b0",
        encoder_weights = None,
        in_channels = 1,
        classes = 1
    ).to(DEVICE)

    model.load_state_dict(torch.load(model_path, map_location=DEVICE))
    model.eval()

    mean, std = 0.5, 0.5
    transform = transforms.Compose([
        transforms.Resize((384, 768)),
        transforms.Grayscale(),
        transforms.ToTensor(),
        transforms.Normalize(mean = [mean], std = [std])
    ])

    try:
        original_size = image.size
        if crop:
            W, H = image.size
            left = int(W * 0.239)
            right = int(W * 0.761)
            top = int(H * 0.2325)
            bottom = int(H * 0.7675)
            image = image.crop((left, top, right, bottom))

        image_tensor = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = model(image_tensor)
            probs = torch.sigmoid(output)
            preds = (probs > threshold).float()

        preds_np = preds.squeeze().cpu().numpy()
        mask_pil = Image.fromarray((preds_np * 255).astype(np.uint8))

        original = image.resize((768, 384)).convert('RGB')
        overlay = Image.new('RGBA', original.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        for x in range(mask_pil.size[0]):
            for y in range(mask_pil.size[1]):
                if mask_pil.getpixel((x, y)) > 0:
                    draw.point((x, y), (255, 0, 0, 128))
        overlaid = Image.alpha_composite(original.convert('RGBA'), overlay)

        mask_buff = io.BytesIO()
        mask_pil.save(mask_buff, format = "PNG")
        mask_b64 = base64.b64encode(mask_buff.getvalue()).decode()

        overlay_buff = io.BytesIO()
        overlaid.save(overlay_buff, format = "PNG")
        overlay_b64 = base64.b64encode(overlay_buff.getvalue()).decode()

        return {
            "mask": mask_b64,
            "overlay": overlay_b64,
            "caries_detected": bool(np.any(preds_np > 0)),
            "caries_area_ratio": float(np.mean(preds_np)),
            "mask_np": preds_np,
            "original_size": original_size,
            "cropped_image": image,
            "crop_coords": (left, top, right, bottom)
        }

    except Exception as e:
        print(f"error processing image: {str(e)}")
        return {"error": str(e)}


def detect(img_input, yolo_path = '/app/models/best.pt', unet_path = '/app/models/best_model4.pth', threshold = 0.01):

    boxes = []
    classes = []
    confidences = []
    caries_teeth = []
    caries_boxes = []
    caries_confidences = []
    caries_area_ratio = 0.0

    model = YOLO(yolo_path)

    if isinstance(img_input, str):
        image = cv2.imread(img_input)
    else:
        image = img_input

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = model.predict(source = image_rgb, conf = 0.5)


    for result in results:
        boxes = result.boxes.xyxy
        classes = result.boxes.cls
        confidences = result.boxes.conf

    original_pil = Image.fromarray(image_rgb)

    caries_segm_result = segment_caries(
        image = original_pil,
        model_path = unet_path,
        threshold = threshold,
        crop = True
    )


    if "caries_detected" in caries_segm_result and caries_segm_result['caries_detected']:
        caries_area_ratio = caries_segm_result['caries_area_ratio']
        print(f"Caries detected in the image with area ratio {caries_area_ratio:.4f}")

        left, top, right, bottom = caries_segm_result['crop_coords']
        cropped_W = right - left
        cropped_H = bottom - top
        original_size = caries_segm_result['original_size']
        W, H = original_size

        mask_np = caries_segm_result['mask_np']
        mask_resized = cv2.resize(mask_np, (768, 384), interpolation = cv2.INTER_NEAREST)

        mask_original = np.zeros((H, W), dtype = np.uint8)
        mask_resized_cropped = cv2.resize(mask_resized, (cropped_W, cropped_H), interpolation = cv2.INTER_NEAREST)

        h, w = mask_resized_cropped.shape
        if h == cropped_H and w == cropped_W:
            mask_original[top:bottom, left:right] = mask_resized_cropped
        else:
            h_clip = min(cropped_H, h)
            w_clip = min(cropped_W, w)
            mask_original[top:top + h_clip, left:left + w_clip] = mask_resized_cropped[:h_clip, :w_clip]

        for box, cls, conf in zip(boxes, classes, confidences):
            x_min, y_min, x_max, y_max = map(int, box)
            class_id = int(cls)
            final_name = tooth_name_mapping[class_id]

            tooth_mask = np.zeros((H, W), dtype=np.uint8)
            tooth_mask[y_min:y_max, x_min:x_max] = 1

            overlap = np.logical_and(mask_original > 0, tooth_mask).sum()
            tooth_area = (x_max - x_min) * (y_max - y_min)
            overlap_ratio = overlap / tooth_area if tooth_area > 0 else 0

            if overlap_ratio > 0.01:
                caries_teeth.append(final_name)
                caries_boxes.append((x_min, y_min, x_max, y_max))
                caries_confidences.append(conf)
                print(f"Caries detected on {final_name} with overlap ratio {overlap_ratio:.4f}")

    vis_pil = Image.fromarray(image_rgb)
    vis_cropped = vis_pil.crop((left, top, right, bottom)).resize((768, 384))
    vis_cropped_rgb = np.array(vis_cropped)

    for (x_min, y_min, x_max, y_max), final_name, conf in zip(caries_boxes, caries_teeth, caries_confidences):
        x_min_cropped = int((x_min - left) * 768 / cropped_W)
        x_max_cropped = int((x_max - left) * 768 / cropped_W)
        y_min_cropped = int((y_min - top) * 384 / cropped_H)
        y_max_cropped = int((y_max - top) * 384 / cropped_H)

        cv2.rectangle(vis_cropped_rgb, (x_min_cropped, y_min_cropped), (x_max_cropped, y_max_cropped), (0, 255, 0), 2)


    overlaid = Image.open(io.BytesIO(base64.b64decode(caries_segm_result['overlay']))).convert('RGBA')
    overlaid_np = np.array(overlaid)

    vis_cropped_rgba = Image.fromarray(vis_cropped_rgb).convert('RGBA')
    vis_cropped_np = np.array(vis_cropped_rgba)

    alpha = 0.5
    combined = (vis_cropped_np.astype(float) * alpha + overlaid_np.astype(float) * (1 - alpha)).astype(np.uint8)

    combined_pil = Image.fromarray(combined)
    output_buffer = io.BytesIO()
    combined_pil.save(output_buffer, format = "PNG")
    output_image_base64 = base64.b64encode(output_buffer.getvalue()).decode()

    return {
        "output_image": output_image_base64,
        "caries_teeth": caries_teeth,
        # "caries_area_ratio": caries_area_ratio
    }