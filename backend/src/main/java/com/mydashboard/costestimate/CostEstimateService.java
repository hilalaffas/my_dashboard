package com.mydashboard.costestimate;

import static com.mydashboard.costestimate.CostEstimateDtos.*;

import com.mydashboard.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Semua method menerima ownerId dan hanya menyentuh data milik pengguna itu (data orang lain dijawab 404). */
@Service
@RequiredArgsConstructor
@Transactional
public class CostEstimateService {

    private final CostEstimateRepository repository;

    @Transactional(readOnly = true)
    public List<CostEstimateResponse> list(UUID ownerId) {
        return repository.findAllByOwnerIdOrderByCreatedAtAsc(ownerId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CostEstimateTotals totals(UUID ownerId) {
        List<CostEstimate> all = repository.findAllByOwnerIdOrderByCreatedAtAsc(ownerId);
        BigDecimal debit = all.stream().map(CostEstimate::getDebit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credit = all.stream().map(CostEstimate::getCredit).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CostEstimateTotals(debit, credit, all.size());
    }

    public CostEstimateResponse create(UUID ownerId, CostEstimateRequest req) {
        CostEstimate e = new CostEstimate();
        e.setOwnerId(ownerId);
        return toResponse(repository.save(apply(e, req)));
    }

    public CostEstimateResponse update(UUID ownerId, UUID id, CostEstimateRequest req) {
        return toResponse(apply(find(ownerId, id), req));
    }

    public void delete(UUID ownerId, UUID id) {
        repository.delete(find(ownerId, id));
    }

    private CostEstimate find(UUID ownerId, UUID id) {
        return repository.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new NotFoundException("Estimasi tidak ditemukan."));
    }

    private CostEstimate apply(CostEstimate e, CostEstimateRequest req) {
        e.setType(req.type().trim());
        e.setDetail(req.detail().trim());
        e.setDebit(req.debit());
        e.setCredit(req.credit());
        return e;
    }

    private CostEstimateResponse toResponse(CostEstimate e) {
        return new CostEstimateResponse(e.getId(), e.getType(), e.getDetail(), e.getDebit(), e.getCredit());
    }
}
