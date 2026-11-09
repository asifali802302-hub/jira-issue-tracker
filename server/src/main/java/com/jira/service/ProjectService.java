package com.jira.service;

import com.jira.dto.ProjectRequest;
import com.jira.model.Project;
import com.jira.model.Role;
import com.jira.model.User;
import com.jira.repository.ProjectRepository;
import com.jira.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Project> getProjectsForUser(User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            return projectRepository.findAll();
        }
        return projectRepository.findAllForUser(user);
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Transactional
    public Project createProject(ProjectRequest request, User owner) {
        if (projectRepository.existsByKey(request.getKey().toUpperCase())) {
            throw new IllegalArgumentException("Project key already exists: " + request.getKey());
        }

        Project project = new Project(request.getName(), request.getKey(), request.getDescription(), owner);

        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            Set<User> members = new HashSet<>(userRepository.findAllById(request.getMemberIds()));
            members.add(owner);
            project.setMembers(members);
        }

        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, ProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        // Only owner or admin can update project details
        if (currentUser.getRole() != Role.ROLE_ADMIN && !project.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("You do not have permission to edit this project");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        if (request.getMemberIds() != null) {
            Set<User> members = new HashSet<>(userRepository.findAllById(request.getMemberIds()));
            members.add(project.getOwner());
            project.setMembers(members);
        }

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        if (currentUser.getRole() != Role.ROLE_ADMIN && !project.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("You do not have permission to delete this project");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public Project addMemberToProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        project.getMembers().add(user);
        return projectRepository.save(project);
    }
}
