package com.jira.dto;

import com.jira.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class IssueStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private IssueStatus status;

    private Integer orderIndex = 0;

    public IssueStatusUpdateRequest() {}

    public IssueStatusUpdateRequest(IssueStatus status, Integer orderIndex) {
        this.status = status;
        this.orderIndex = orderIndex;
    }

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
