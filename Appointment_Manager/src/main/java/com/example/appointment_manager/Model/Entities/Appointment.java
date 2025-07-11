package com.example.appointment_manager.Model.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private LocalDate date;
    private String reason;
    @Enumerated(EnumType.STRING)
    private Status status;
    public enum Status {
        PENDING,
        CONFIRMED,
        CANCELLED
    }

    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }

    public void setDate(LocalDate date) { this.date = date; }

    public void setReason(String reason) { this.reason = reason; }

    public void setStatus(Status status) { this.status = status; }

    public UUID getId() {
        return id;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getReason() {
        return reason;
    }

    public Status getStatus() {
        return status;
    }
}
