package com.example.User_Management.Model.Repository;

import com.example.User_Management.Model.Entities.PatientMedicalRecord;
import com.example.User_Management.Model.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PatientMedicalRecordRepository extends JpaRepository<PatientMedicalRecord, UUID> {
    PatientMedicalRecord findByUser(User user);}
