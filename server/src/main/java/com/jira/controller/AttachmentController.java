package com.jira.controller;

import com.jira.model.Attachment;
import com.jira.model.Issue;
import com.jira.model.User;
import com.jira.repository.AttachmentRepository;
import com.jira.repository.IssueRepository;
import com.jira.repository.UserRepository;
import com.jira.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Attachments", description = "Issue screenshot and attachment upload APIs")
public class AttachmentController {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/issues/{issueId}/attachments")
    @Operation(summary = "Get all attachments for an issue")
    public ResponseEntity<List<Attachment>> getAttachments(@PathVariable Long issueId) {
        return ResponseEntity.ok(attachmentRepository.findByIssueIdOrderByCreatedAtDesc(issueId));
    }

    @PostMapping(value = "/issues/{issueId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a screenshot or file attachment to an issue")
    public ResponseEntity<?> uploadAttachment(
            Authentication auth,
            @PathVariable Long issueId,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File cannot be empty"));
        }

        try {
            User user = getAuthenticatedUser(auth);
            Issue issue = issueRepository.findById(issueId)
                    .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + issueId));

            String base64Data = Base64.getEncoder().encodeToString(file.getBytes());
            Attachment attachment = new Attachment(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    base64Data,
                    issue,
                    user
            );

            Attachment saved = attachmentRepository.save(attachment);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload file"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/attachments/{id}")
    @Operation(summary = "Delete an attachment")
    public ResponseEntity<?> deleteAttachment(Authentication auth, @PathVariable Long id) {
        return attachmentRepository.findById(id).map(att -> {
            attachmentRepository.delete(att);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
