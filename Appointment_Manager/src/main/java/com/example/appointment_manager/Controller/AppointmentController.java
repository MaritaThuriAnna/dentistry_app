package com.example.appointment_manager.Controller;

import com.example.appointment_manager.DTO.AppointmentDTO;
import com.example.appointment_manager.Model.Entities.Appointment;
import com.example.appointment_manager.Service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Appointments")
public class AppointmentController {

    private AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PostMapping("/Schedule")
    public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentDTO dto) {
        Appointment appointment = appointmentService.createAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PutMapping("/Update/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable UUID id, @RequestBody AppointmentDTO dto) {
        Appointment updatedAppointment = appointmentService.updateAppointment(id, dto);
        return ResponseEntity.ok(updatedAppointment);
    }


    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/Doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(doctorId));
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/Patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable UUID patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(patientId));
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PutMapping("/Confirm/{id}")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(id));
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @PutMapping("/Cancel/{id}")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/Pending")
    public ResponseEntity<List<Appointment>> getPendingAppointments() {
        return ResponseEntity.ok(appointmentService.getPendingAppointments());
    }
}
