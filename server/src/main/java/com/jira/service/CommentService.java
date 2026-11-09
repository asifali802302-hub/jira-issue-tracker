package com.jira.service;

import com.jira.dto.CommentRequest;
import com.jira.model.Comment;
import com.jira.model.Issue;
import com.jira.model.User;
import com.jira.repository.CommentRepository;
import com.jira.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private IssueRepository issueRepository;

    public List<Comment> getCommentsForIssue(Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
    }

    @Transactional
    public Comment addComment(Long issueId, CommentRequest request, User author) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + issueId));

        Comment comment = new Comment(request.getContent(), author, issue);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new SecurityException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}
