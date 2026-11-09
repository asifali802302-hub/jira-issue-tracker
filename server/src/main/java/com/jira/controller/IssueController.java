package com.jira.controller;

import com.jira.dto.IssueRequest;
import com.jira.dto.IssueStatusUpdateRequest;
import com.jira.model.Issue;
import com.jira.model.IssuePriority;
import com.jira.model.IssueStatus;
import com.jira.model.User;
import com.jira.repository.UserRepository;
import com.jira.security.UserDetailsImpl;
import com.jira.service.IssueService;
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
@RequestMapping("/api/issues")
@Tag(name = "Issues", description = "Ticket, Bug & Task CRUD and Kanban workflow APIs")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all issues in a project")
    public ResponseEntity<List<Issue>> getIssuesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }

    @GetMapping("/project/{projectId}/filter")
    @Operation(summary = "Search and filter issues by status, priority, assignee, and keyword")
    public ResponseEntity<List<Issue>> searchIssues(
            @PathVariable Long projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok(issueService.searchAndFilterIssues(projectId, status, priority, assigneeId, query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get issue details by ID")
    public ResponseEntity<?> getIssueById(@PathVariable Long id) {
        return issueService.getIssueById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new issue/ticket")
    public ResponseEntity<?> createIssue(Authentication auth, @Valid @RequestBody IssueRequest request) {
        try {
            User reporter = getAuthenticatedUser(auth);
            Issue created = issueService.createIssue(request, reporter);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update full issue details")
    public ResponseEntity<?> updateIssue(@PathVariable Long id, @Valid @RequestBody IssueRequest request) {
        try {
            Issue updated = issueService.updateIssue(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update issue status and Kanban order index (for drag and drop)")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                         @Valid @RequestBody IssueStatusUpdateRequest request) {
        try {
            Issue updated = issueService.updateIssueStatus(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an issue/ticket")
    public ResponseEntity<?> deleteIssue(Authentication auth, @PathVariable Long id) {
        try {
            User user = getAuthenticatedUser(auth);
            issueService.deleteIssue(id, user);
            return ResponseEntity.ok(Map.of("message", "Issue deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
