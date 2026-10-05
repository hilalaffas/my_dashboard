package com.mydashboard.costestimate;

import static com.mydashboard.costestimate.CostEstimateDtos.*;

import com.mydashboard.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CostEstimateService {

    private final CostEstimateRepository repository;

    @Transactional(readOnly = true)
    public List<CostEstimateResponse> list() {
        return repository.findAllByOrderByCreatedAtAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CostEstimateTotals totals() {
        List<CostEstimate> all = repository.findAll();
        BigDecimal debit = all.stream().map(CostEstimate::getDebit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credit = all.stream().map(CostEstimate::getCredit).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CostEstimateTotals(debit, credit, all.size());
    }

    public CostEstimateResponse create(CostEstimateRequest req) {
        return toResponse(repository.save(apply(new CostEstimate(), req)));
    }

    public CostEstimateResponse update(UUID id, CostEstimateRequest req) {
        return toResponse(apply(find(id), req));
    }

    public void delete(UUID id) {
        repository.delete(find(id));
    }

    private CostEstimate find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Estimasi tidak ditemukan."));
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
