package com.example.image_management.Model.Repository;
import com.example.image_management.Model.Entities.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    List<Image> findByPatientId(UUID patientId);
    Image findByImageId(UUID imageId);
}