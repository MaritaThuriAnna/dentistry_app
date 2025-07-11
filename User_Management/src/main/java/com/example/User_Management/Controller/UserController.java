package com.example.User_Management.Controller;

import com.example.User_Management.DTO.PatientDTO;
import com.example.User_Management.Model.Entities.User;
import com.example.User_Management.Service.UserServiceImplementation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/User")
public class UserController {
    @Autowired
    private final UserServiceImplementation userServiceImplementation;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/Insert")
    public void insert(@RequestBody User user){
        System.out.println(user);
        userServiceImplementation.Insert(user);
    }

    @GetMapping("/ReadAll")
    public ResponseEntity<List<User>> readAll(){
        List<User> users = userServiceImplementation.ReadAll();
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @PutMapping("/Update")
    public ResponseEntity<User> update(@RequestBody User user){
        User updatedUser = userServiceImplementation.Update(user);
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }

    @PutMapping("/UpdateFull")
    public ResponseEntity<?> updateUserAndMedicalRecord(@RequestBody PatientDTO userWithMedicalRecordDTO) {
        User updatedUser = userServiceImplementation.updateUserAndMedicalRecord(userWithMedicalRecordDTO);
        return ResponseEntity.status(HttpStatus.OK).body(updatedUser);
    }

    @DeleteMapping("/Delete/{id}")
    public ResponseEntity<User> delete(@PathVariable("id") UUID id){
        User user = userServiceImplementation.Delete(id);
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/findUserById")
    public ResponseEntity<User> findUserById(@RequestParam UUID id) {
        User user = userServiceImplementation.findUserById(id);
        return ResponseEntity.ok(user);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/findByEmail")
    public ResponseEntity<User> findByEmail(@RequestParam String email) {
        User user = userServiceImplementation.findUserByEmail(email);
        return ResponseEntity.ok(user);
    }


    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/Login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String userEmail = payload.get("userEmail");
        String userPassword = payload.get("userPassword");

        System.out.println("Login request received for: " + userEmail);

        User user = userServiceImplementation.findUserByEmail(userEmail);
        if (user != null && passwordEncoder.matches(userPassword, user.getPassword())) {
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("role", user.getRole());
            response.put("token", "mock-jwt-token");

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }

    @GetMapping("/findPatientWithRecord")
    public ResponseEntity<User> findPatientWithRecord(@RequestParam UUID id) {
        User user = userServiceImplementation.getPatientWithFullMedicalRecord(id);
        return ResponseEntity.ok(user);
    }

}
