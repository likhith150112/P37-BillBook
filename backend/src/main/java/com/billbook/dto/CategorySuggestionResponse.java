package com.billbook.dto;

import java.util.List;

public record CategorySuggestionResponse(
        String category,
        String hsnCode,
        int suggestedGstRate,
        double confidence,
        List<String> matchedKeywords,
        String explanation,
        boolean advisoryOnly
) {}
