package com.example.image_management.Controller;

import com.example.image_management.AppConfig.MultipartInputStreamFileResource;
import com.example.image_management.DTO.ImageResponseDTO;
import com.example.image_management.Model.Entities.Image;
import com.example.image_management.Service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Images")
public class ImageController {

    private final ImageService imageService;
    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/Upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") UUID patientId,
            @RequestParam("doctorId") UUID doctorId,
            @RequestParam(value = "doctorNote", required = false) String doctorNote) throws IOException {

        Image image = new Image();
        image.setPatientId(patientId);
        image.setUploadedBy(doctorId);
        image.setOriginalImageData(file.getBytes());
        image.setDoctorNote(doctorNote != null ? doctorNote : "");
        image.setUploadDate(new Date());
        imageService.saveImage(image);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Image uploaded successfully");
        return ResponseEntity.ok(response);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/{id}")
    public ResponseEntity<Image> getImage(@PathVariable UUID id) {
        return ResponseEntity.ok(imageService.getImage(id));
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/AnalyzeOnly")
    public ResponseEntity<Map<String, Object>> analyzeOnly(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") String patientId,
            @RequestParam("doctorId") String doctorId) throws IOException {

        System.out.println("Received /AnalyzeOnly request");
        System.out.println("Uploaded File Size: " + file.getSize());
        System.out.println("Uploaded File Name: " + file.getOriginalFilename());
        if (file.isEmpty()) {
            System.out.println("Error: Uploaded file is empty");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Uploaded file is empty");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        byte[] originalImageBytes;
        try {
            originalImageBytes = file.getBytes();
            System.out.println("Original Image Bytes Length: " + originalImageBytes.length);
            if (originalImageBytes.length == 0) {
                System.out.println("Error: Original image bytes are empty");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Original image bytes are empty");
                return ResponseEntity.badRequest().body(errorResponse);
            }
        } catch (IOException e) {
            System.out.println("Error reading original image bytes: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to read original image: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        String pythonUrl = "http://localhost:8000/detect_caries";
        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(pythonUrl, requestEntity, Map.class);
            System.out.println("Python API Response Status: " + response.getStatusCode());
        } catch (Exception e) {
            System.out.println("Error calling Python API: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to call Python API: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }

        if (response.getStatusCode().is2xxSuccessful()) {
            Map<String, Object> bodyResponse = response.getBody();
            if (bodyResponse != null) {
                System.out.println("Python API Response: " + bodyResponse);

                String base64Image = (String) bodyResponse.get("output_image");
                if (base64Image == null || base64Image.isEmpty()) {
                    System.out.println("Error: output_image from Python API is null or empty");
                    bodyResponse.put("error", "Invalid output_image from Python API");
                    return ResponseEntity.badRequest().body(bodyResponse);
                }

                byte[] processedImageBytes;
                try {
                    processedImageBytes = java.util.Base64.getDecoder().decode(base64Image);
                    System.out.println("Processed Image Bytes Length: " + processedImageBytes.length);
                    if (processedImageBytes.length == 0) {
                        System.out.println("Error: Processed image bytes are empty");
                        bodyResponse.put("error", "Processed image bytes are empty");
                        return ResponseEntity.badRequest().body(bodyResponse);
                    }
                } catch (IllegalArgumentException e) {
                    System.out.println("Error decoding output_image: " + e.getMessage());
                    bodyResponse.put("error", "Invalid base64 data from Python API");
                    return ResponseEntity.badRequest().body(bodyResponse);
                }

                // Safely handle caries_teeth
                Object cariesTeethObj = bodyResponse.get("caries_teeth");
                List<String> cariesTeeth = new ArrayList<>();
                if (cariesTeethObj instanceof List) {
                    cariesTeeth = (List<String>) cariesTeethObj;
                    System.out.println("caries_teeth as List: " + cariesTeeth);
                } else if (cariesTeethObj instanceof String) {
                    cariesTeeth.add((String) cariesTeethObj);
                    System.out.println("caries_teeth as String: " + cariesTeeth);
                } else {
                    System.out.println("caries_teeth is neither List nor String: " + cariesTeethObj);
                }

                String analysisResult = cariesTeeth != null && !cariesTeeth.isEmpty()
                        ? "Caries detected on: " + String.join(", ", cariesTeeth)
                        : "No caries detected.";

                Image image = new Image();
                image.setPatientId(java.util.UUID.fromString(patientId));
                image.setUploadedBy(java.util.UUID.fromString(doctorId));
                image.setOriginalImageData(originalImageBytes);
                image.setProcessedImageData(processedImageBytes);
                image.setAnalysisResult(analysisResult);
                image.setDoctorNote("");
                image.setUploadDate(new Date());

                System.out.println("Image object before saving: " + image);
                try {
                    imageService.saveImage(image);
                    System.out.println("Image saved successfully");
                } catch (Exception e) {
                    System.out.println("Error saving image to database: " + e.getMessage());
                    e.printStackTrace();
                    bodyResponse.put("error", "Failed to save image to database: " + e.getMessage());
                    return ResponseEntity.status(500).body(bodyResponse);
                }

                bodyResponse.put("patientId", patientId);
                bodyResponse.put("doctorId", doctorId);
                bodyResponse.put("imageId", image.getImageId().toString());
                return ResponseEntity.ok(bodyResponse);
            }
        }

        System.out.println("Python API Request Failed: " + response.getStatusCode());
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @PutMapping("/{imageId}/updateNote")
    public ResponseEntity<Map<String, String>> updateDoctorNote(
            @PathVariable UUID imageId,
            @RequestParam String doctorNote) {
        try {
            Image image = imageService.findById(imageId);
            if (image == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Image not found");
                return ResponseEntity.status(404).body(errorResponse);
            }

            image.setDoctorNote(doctorNote);
            imageService.saveImage(image);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Doctor note updated successfully");
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            System.out.println("Error updating doctor note: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to update doctor note: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/Patient/{patientId}")
    public ResponseEntity<List<ImageResponseDTO>> getImagesByPatient(@PathVariable UUID patientId) {
        List<Image> images = imageService.getImagesByPatient(patientId);
        List<ImageResponseDTO> response = images.stream().map(image -> {
            String base64Image = java.util.Base64.getEncoder().encodeToString(image.getProcessedImageData());
            return new ImageResponseDTO(
                    image.getImageId(),
                    "data:image/png;base64," + base64Image,
                    image.getAnalysisResult(),
                    image.getDoctorNote(),
                    image.getUploadDate()
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
