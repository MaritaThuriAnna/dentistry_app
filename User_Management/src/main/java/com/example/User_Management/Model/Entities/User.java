package com.example.User_Management.Model.Entities;

import com.example.User_Management.Model.Entities.PatientMedicalRecord;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID userId;

    private String surname;
    private String forname;

    @Column(unique = true, nullable = false)
    private String email;

    private String telNr;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String profilePictureUrl;
    private String gender;
    private String address;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private PatientMedicalRecord medicalRecord;

    public enum Role {
        ADMIN, DENTIST, PATIENT
    }
}
