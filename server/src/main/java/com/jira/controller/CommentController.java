package com.jira.controller;

import com.jira.dto.CommentRequest;
import com.jira.model.Comment;
import com.jira.model.User;
import com.jira.repository.UserRepository;
import com.jira.security.UserDetailsImpl;
import com.jira.service.CommentService;
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
@RequestMapping("/api")
@Tag(name = "Comments", description = "Ticket collaboration & discussion comments APIs")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/issues/{issueId}/comments")
    @Operation(summary = "Get all comments for an issue")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long issueId) {
        return ResponseEntity.ok(commentService.getCommentsForIssue(issueId));
    }

    @PostMapping("/issues/{issueId}/comments")
    @Operation(summary = "Add a comment to an issue")
    public ResponseEntity<?> addComment(Authentication auth, @PathVariable Long issueId,
                                       @Valid @RequestBody CommentRequest request) {
        try {
            User user = getAuthenticatedUser(auth);
            Comment created = commentService.addComment(issueId, request, user);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete comment by ID")
    public ResponseEntity<?> deleteComment(Authentication auth, @PathVariable Long id) {
        try {
            User user = getAuthenticatedUser(auth);
            commentService.deleteComment(id, user);
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
