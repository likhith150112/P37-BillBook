package com.billbook.service;

import com.billbook.dto.CategorySuggestionResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AutoCategorisationService {

    private record Rule(String category, String hsnCode, int gstRate, List<String> keywords) {}

    private static final List<Rule> RULES = List.of(
            new Rule("IT Hardware & Computing", "8471", 18, List.of("laptop", "desktop", "computer", "server", "ssd", "ram", "keyboard", "mouse", "workstation", "thinkbook")),
            new Rule("Monitors & Displays", "8528", 18, List.of("monitor", "display", "led screen", "projector", "panel")),
            new Rule("Networking & Telecom", "8517", 18, List.of("router", "switch", "modem", "wifi", "ethernet", "firewall")),
            new Rule("Printers & Scanners", "8443", 18, List.of("printer", "scanner", "toner", "cartridge", "pos thermal")),
            new Rule("Office Furniture", "9403", 18, List.of("chair", "desk", "table", "cabinet", "ergonomic")),
            new Rule("Paper & Stationery", "4820", 12, List.of("notebook", "register", "ledger", "paper", "a4", "stationery")),
            new Rule("Books & Educational Print", "4901", 0, List.of("book", "textbook", "manual", "handbook")),
            new Rule("Food Grains & Staples", "1006", 5, List.of("rice", "basmati", "wheat", "flour", "dal", "spice")),
            new Rule("Electrical & Power Backup", "8504", 18, List.of("ups", "inverter", "transformer", "adapter", "power supply")),
            new Rule("Air Conditioning & Luxury Appliances", "8415", 28, List.of("air conditioner", "split ac", "hvac", "chiller")),
            new Rule("Software & IT Consulting (SAC)", "9983", 18, List.of("software", "license", "amc", "maintenance", "consulting", "support"))
    );

    public CategorySuggestionResponse suggest(String name, String description) {
        String haystack = ((name == null ? "" : name) + " " + (description == null ? "" : description))
                .toLowerCase(Locale.ROOT).trim();

        Rule bestRule = null;
        List<String> bestMatches = List.of();

        for (Rule rule : RULES) {
            List<String> matches = new ArrayList<>();
            for (String kw : rule.keywords()) {
                if (haystack.contains(kw)) {
                    matches.add(kw);
                }
            }
            if (matches.size() > bestMatches.size()) {
                bestMatches = matches;
                bestRule = rule;
            }
        }

        if (bestRule != null && !bestMatches.isEmpty()) {
            double confidence = Math.min(0.98, 0.72 + bestMatches.size() * 0.12);
            return new CategorySuggestionResponse(
                    bestRule.category(),
                    bestRule.hsnCode(),
                    bestRule.gstRate(),
                    confidence,
                    bestMatches,
                    "Matched keywords " + bestMatches + " -> HSN " + bestRule.hsnCode() + " (" + bestRule.gstRate() + "% GST). Advisory only.",
                    true
            );
        }

        return new CategorySuggestionResponse(
                "General Commercial Goods",
                "8543",
                18,
                0.55,
                List.of(),
                "No specialized keyword matched; suggested standard 18% commercial GST slab for review.",
                true
        );
    }

    public Integer expectedGstForHsn(String hsnCode) {
        if (hsnCode == null) return null;
        String prefix = hsnCode.trim().length() >= 4 ? hsnCode.trim().substring(0, 4) : hsnCode.trim();
        return RULES.stream()
                .filter(r -> r.hsnCode().equals(prefix))
                .map(Rule::gstRate)
                .findFirst()
                .orElse(null);
    }
}
