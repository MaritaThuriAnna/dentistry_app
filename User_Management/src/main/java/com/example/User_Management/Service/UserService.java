package com.example.User_Management.Service;

import com.example.User_Management.Model.Entities.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public interface UserService {
    void Insert(User user);
    List<User> ReadAll();
    User Update(User user);
    User Delete(UUID id);
    User findUserById(UUID id);
    User findUserByEmail(String email);
}
