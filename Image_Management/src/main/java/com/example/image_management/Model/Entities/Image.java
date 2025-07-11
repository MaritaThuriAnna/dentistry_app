package com.example.image_management.Model.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "image")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID imageId;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID uploadedBy;

    @Lob
    @Column( columnDefinition = "LONGBLOB NOT NULL")
    private byte[] originalImageData;

    @Lob
    @Column( columnDefinition = "LONGBLOB NOT NULL")
    private byte[] processedImageData;

    @Column(columnDefinition = "TEXT")
    private String analysisResult;

    @Column(columnDefinition = "TEXT")
    private String doctorNote;

    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadDate = new Date();
}