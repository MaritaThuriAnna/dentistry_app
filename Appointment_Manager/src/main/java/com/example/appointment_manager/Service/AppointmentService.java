package com.example.appointment_manager.Service;

import com.example.appointment_manager.DTO.AppointmentDTO;
import com.example.appointment_manager.Model.Entities.Appointment;
import com.example.appointment_manager.Model.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment createAppointment(AppointmentDTO dto) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.getPatientId());
        appointment.setDoctorId(dto.getDoctorId());
        appointment.setDate(dto.getDate());
        appointment.setReason(dto.getReason());
        appointment.setStatus(Appointment.Status.PENDING);

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(UUID id, AppointmentDTO dto) {
        Appointment existingAppointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        existingAppointment.setDate(dto.getDate());
        existingAppointment.setReason(dto.getReason());
        existingAppointment.setStatus(Appointment.Status.PENDING);

        return appointmentRepository.save(existingAppointment);
    }

    public List<Appointment> getAppointmentsForDoctor(UUID doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        for (Appointment a : appointments) {
            System.out.println("Appointment ID: " + a.getId());
            System.out.println("Appointment date: " + a.getDate());
            System.out.println("Patient: " + a.getPatientId());
        }
        return appointments;
    }

    public List<Appointment> getAppointmentsForPatient(UUID patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);

        for (Appointment a : appointments) {
            System.out.println("Appointment ID: " + a.getId());
            System.out.println("Appointment date: " + a.getDate());
        }
        return appointments;
    }


    public Appointment confirmAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Appointment.Status.CONFIRMED);
        return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Appointment.Status.CANCELLED);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getPendingAppointments() {
        return appointmentRepository.findByStatus(Appointment.Status.PENDING);
    }
}
