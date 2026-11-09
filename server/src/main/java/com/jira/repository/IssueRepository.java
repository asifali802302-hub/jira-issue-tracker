package com.jira.repository;

import com.jira.model.Issue;
import com.jira.model.IssuePriority;
import com.jira.model.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProjectIdOrderByOrderIndexAscCreatedAtDesc(Long projectId);

    List<Issue> findByProjectIdAndStatusOrderByOrderIndexAsc(Long projectId, IssueStatus status);

    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId " +
            "AND (:status IS NULL OR i.status = :status) " +
            "AND (:priority IS NULL OR i.priority = :priority) " +
            "AND (:assigneeId IS NULL OR (i.assignee IS NOT NULL AND i.assignee.id = :assigneeId)) " +
            "AND (:query IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY i.orderIndex ASC, i.createdAt DESC")
    List<Issue> searchAndFilter(
            @Param("projectId") Long projectId,
            @Param("status") IssueStatus status,
            @Param("priority") IssuePriority priority,
            @Param("assigneeId") Long assigneeId,
            @Param("query") String query
    );
}
