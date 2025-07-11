package com.example.User_Management.Model.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientMedicalRecord implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "userId", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @ElementCollection
    private List<String> allergies;

    @ElementCollection
    private List<String> conditions;

    @ElementCollection
    private List<String> previousTreatments;

    @ElementCollection
    private List<String> doctorNotes;
}
