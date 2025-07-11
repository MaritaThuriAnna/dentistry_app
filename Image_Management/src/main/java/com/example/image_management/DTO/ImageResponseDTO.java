package com.example.image_management.DTO;

import lombok.Getter;

import java.util.Date;
import java.util.UUID;

@Getter
public class ImageResponseDTO {
    private UUID imageId;
    private String image;
    private String analysis;
    private String doctorNote;
    private Date uploadDate;

    public ImageResponseDTO(UUID imageId, String image, String analysis, String doctorNote, Date uploadDate) {
        this.imageId = imageId;
        this.image = image;
        this.analysis = analysis;
        this.doctorNote = doctorNote;
        this.uploadDate = uploadDate;
    }

}
