package com.jira.controller;

import com.jira.dto.ProjectRequest;
import com.jira.model.Project;
import com.jira.model.User;
import com.jira.repository.UserRepository;
import com.jira.security.UserDetailsImpl;
import com.jira.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project creation, management and team member APIs")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping
    @Operation(summary = "List all projects accessible to current user")
    public ResponseEntity<List<Project>> getProjects(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(projectService.getProjectsForUser(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<?> createProject(Authentication auth, @Valid @RequestBody ProjectRequest request) {
        try {
            User user = getAuthenticatedUser(auth);
            Project project = projectService.createProject(request, user);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project information")
    public ResponseEntity<?> updateProject(Authentication auth, @PathVariable Long id,
                                          @Valid @RequestBody ProjectRequest request) {
        try {
            User user = getAuthenticatedUser(auth);
            Project project = projectService.updateProject(id, request, user);
            return ResponseEntity.ok(project);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project by ID")
    public ResponseEntity<?> deleteProject(Authentication auth, @PathVariable Long id) {
        try {
            User user = getAuthenticatedUser(auth);
            projectService.deleteProject(id, user);
            return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/members/{userId}")
    @Operation(summary = "Add team member to project")
    public ResponseEntity<?> addMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            Project project = projectService.addMemberToProject(id, userId);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
