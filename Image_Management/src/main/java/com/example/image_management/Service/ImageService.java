package com.example.image_management.Service;

import com.example.image_management.Model.Entities.Image;
import com.example.image_management.Model.Repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;

    public List<Image> getImagesByPatient(UUID patientId) {
        return imageRepository.findByPatientId(patientId);
    }

    public Image getImage(UUID imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
    }

    public Image saveImage(Image image) {
        return imageRepository.save(image);
    }

    public Image findById(UUID imageId) {
        return imageRepository.findByImageId(imageId);
    }
}
