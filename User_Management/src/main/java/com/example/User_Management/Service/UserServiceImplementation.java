package com.example.User_Management.Service;

import com.example.User_Management.DTO.PatientDTO;
import com.example.User_Management.Model.Entities.PatientMedicalRecord;
import com.example.User_Management.Model.Entities.User;
import com.example.User_Management.Model.Repository.PatientMedicalRecordRepository;
import com.example.User_Management.Model.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
@Service
public class UserServiceImplementation implements UserService{
    @Autowired
    public UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private PatientMedicalRecordRepository patientMedicalRecordRepository;

    @Override
    public void Insert(User user) {
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        userRepository.save(user);

        if (user.getRole() == User.Role.PATIENT) {
            PatientMedicalRecord record = new PatientMedicalRecord();
            record.setUser(user);
            record.setAllergies(new ArrayList<>());
            record.setConditions(new ArrayList<>());
            record.setPreviousTreatments(new ArrayList<>());
            record.setDoctorNotes(new ArrayList<>());
            patientMedicalRecordRepository.save(record);
        }
    }

    @Override
    public List<User> ReadAll() {
        return userRepository.findAll();
    }

    @Override
    public User Update(User user) {
        return userRepository.save(user);
    }

    @Override
    public User Delete(UUID id) {
        User userToDelete = userRepository.findFirstByUserId(id);
        if (userToDelete != null){
            userRepository.delete(userToDelete);
        }
        return userToDelete;
    }

    @Override
    public User findUserById(UUID id) {
        return userRepository.findFirstByUserId(id);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findFirstByEmail(email);
    }

    public User updateUserAndMedicalRecord(PatientDTO dto) {
        User user = dto.getUser();
        PatientMedicalRecord medicalRecord = dto.getMedicalRecord();

        User existingUser = userRepository.findFirstByUserId(user.getUserId());
        if (existingUser == null) {
            throw new RuntimeException("User not found");
        }

        existingUser.setSurname(user.getSurname());
        existingUser.setForname(user.getForname());
        existingUser.setEmail(user.getEmail());
        existingUser.setTelNr(user.getTelNr());
        existingUser.setProfilePictureUrl(user.getProfilePictureUrl());
        existingUser.setGender(user.getGender());
        existingUser.setAddress(user.getAddress());

        PatientMedicalRecord existingRecord = patientMedicalRecordRepository.findByUser(existingUser);
        if (existingRecord == null) {
            existingRecord = new PatientMedicalRecord();
            existingRecord.setUser(existingUser);
        }

        existingRecord.setAllergies(medicalRecord.getAllergies());
        existingRecord.setConditions(medicalRecord.getConditions());
        existingRecord.setPreviousTreatments(medicalRecord.getPreviousTreatments());
        existingRecord.setDoctorNotes(medicalRecord.getDoctorNotes());

        patientMedicalRecordRepository.save(existingRecord);

        existingUser.setMedicalRecord(existingRecord);

        userRepository.save(existingUser);

        return existingUser;
    }

    public User getPatientWithFullMedicalRecord(UUID userId) {
        return userRepository.findByUserIdWithMedicalRecord(userId);
    }

}
