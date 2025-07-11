package com.example.User_Management.DTO;

import com.example.User_Management.Model.Entities.PatientMedicalRecord;
import com.example.User_Management.Model.Entities.User;
import lombok.Getter;

@Getter
public class PatientDTO {
    private User user;
    private PatientMedicalRecord medicalRecord;

    public void setUser(User user) {
        this.user = user;
    }

}
