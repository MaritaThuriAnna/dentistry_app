package com.example.User_Management.Model.Repository;

import com.example.User_Management.Model.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@EnableJpaRepositories
public interface UserRepository extends JpaRepository<User, UUID> {
    User findFirstByUserId(UUID id);
    User findFirstByEmail(String email);
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.medicalRecord WHERE u.userId = :id")
    User findByUserIdWithMedicalRecord(@Param("id") UUID id);

}
