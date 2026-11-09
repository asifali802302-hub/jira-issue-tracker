package com.jira.config;

import com.jira.model.*;
import com.jira.repository.IssueRepository;
import com.jira.repository.ProjectRepository;
import com.jira.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        System.out.println(">>> Seeding Enterprise Demo Data (Users, Projects, Tickets)...");

        // 1. Create Demo Users across Roles
        User admin = userRepository.save(new User(
                "Asif Ali (Admin)",
                "admin@jira.com",
                passwordEncoder.encode("password123"),
                Role.ROLE_ADMIN
        ));

        User manager = userRepository.save(new User(
                "Sarah Connor (Project Manager)",
                "manager@jira.com",
                passwordEncoder.encode("password123"),
                Role.ROLE_MANAGER
        ));

        User dev1 = userRepository.save(new User(
                "Alex Rivera (Frontend Engineer)",
                "alex@jira.com",
                passwordEncoder.encode("password123"),
                Role.ROLE_DEVELOPER
        ));

        User dev2 = userRepository.save(new User(
                "David Chen (Backend Engineer)",
                "david@jira.com",
                passwordEncoder.encode("password123"),
                Role.ROLE_DEVELOPER
        ));

        // 2. Create Sample Project
        Project project = new Project(
                "Cloud Platform & Mobile App",
                "CPM",
                "Flagship mobile banking application and cloud microservices migration project.",
                admin
        );
        project.setMembers(Set.of(admin, manager, dev1, dev2));
        project = projectRepository.save(project);

        // 3. Seed Realistic Kanban Issues
        // TO DO Column
        issueRepository.save(new Issue(
                "Implement biometric FaceID authentication for iOS",
                "Add native iOS FaceID SDK integration and fallback to 6-digit PIN.",
                IssueType.STORY,
                IssueStatus.TODO,
                IssuePriority.HIGH,
                project,
                dev1,
                manager
        ));

        issueRepository.save(new Issue(
                "Add dark mode theme toggle for mobile settings screen",
                "Users requested a high-contrast dark theme option to save battery on OLED screens.",
                IssueType.TASK,
                IssueStatus.TODO,
                IssuePriority.LOW,
                project,
                dev1,
                manager
        ));

        // IN PROGRESS Column
        issueRepository.save(new Issue(
                "Fix JWT expiration token refresh race condition",
                "When multiple API requests trigger simultaneously on token expiry, duplicate refresh calls occur.",
                IssueType.BUG,
                IssueStatus.IN_PROGRESS,
                IssuePriority.URGENT,
                project,
                dev2,
                admin
        ));

        issueRepository.save(new Issue(
                "Migrate payment gateway webhook listener to Spring Boot 3",
                "Ensure idempotent transaction processing for Stripe/Razorpay webhooks.",
                IssueType.TASK,
                IssueStatus.IN_PROGRESS,
                IssuePriority.MEDIUM,
                project,
                dev2,
                manager
        ));

        // DONE Column
        issueRepository.save(new Issue(
                "Database indexing for user search query optimization",
                "Added compound index on (project_id, status, priority) reducing lookup times to under 15ms.",
                IssueType.TASK,
                IssueStatus.DONE,
                IssuePriority.MEDIUM,
                project,
                dev2,
                admin
        ));

        issueRepository.save(new Issue(
                "Setup automated Docker multi-stage CI/CD pipeline",
                "Configured Dockerfile and cloud build runners for automated deployments.",
                IssueType.STORY,
                IssueStatus.DONE,
                IssuePriority.HIGH,
                project,
                admin,
                manager
        ));

        System.out.println(">>> Demo Data Seeded Successfully!");
    }
}
