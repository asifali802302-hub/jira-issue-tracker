package com.jira.service;

import com.jira.dto.IssueRequest;
import com.jira.dto.IssueStatusUpdateRequest;
import com.jira.model.*;
import com.jira.repository.IssueRepository;
import com.jira.repository.ProjectRepository;
import com.jira.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Issue> getIssuesByProject(Long projectId) {
        return issueRepository.findByProjectIdOrderByOrderIndexAscCreatedAtDesc(projectId);
    }

    public List<Issue> searchAndFilterIssues(Long projectId, IssueStatus status, IssuePriority priority,
                                            Long assigneeId, String query) {
        return issueRepository.searchAndFilter(projectId, status, priority, assigneeId, query);
    }

    public Optional<Issue> getIssueById(Long id) {
        return issueRepository.findById(id);
    }

    @Transactional
    public Issue createIssue(IssueRequest request, User reporter) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + request.getProjectId()));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
        }

        Issue issue = new Issue(
                request.getTitle(),
                request.getDescription(),
                request.getType(),
                request.getStatus(),
                request.getPriority(),
                project,
                assignee,
                reporter
        );

        return issueRepository.save(issue);
    }

    @Transactional
    public Issue updateIssue(Long id, IssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + id));

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setStatus(request.getStatus());
        issue.setPriority(request.getPriority());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
            issue.setAssignee(assignee);
        } else {
            issue.setAssignee(null);
        }

        return issueRepository.save(issue);
    }

    @Transactional
    public Issue updateIssueStatus(Long id, IssueStatusUpdateRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + id));

        issue.setStatus(request.getStatus());
        if (request.getOrderIndex() != null) {
            issue.setOrderIndex(request.getOrderIndex());
        }

        return issueRepository.save(issue);
    }

    @Transactional
    public void deleteIssue(Long id, User currentUser) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + id));

        // Admin, Manager, Reporter, or Project Owner can delete
        boolean isPrivileged = currentUser.getRole() == Role.ROLE_ADMIN ||
                currentUser.getRole() == Role.ROLE_MANAGER ||
                issue.getReporter().getId().equals(currentUser.getId()) ||
                issue.getProject().getOwner().getId().equals(currentUser.getId());

        if (!isPrivileged) {
            throw new SecurityException("You do not have permission to delete this ticket");
        }

        issueRepository.delete(issue);
    }
}
