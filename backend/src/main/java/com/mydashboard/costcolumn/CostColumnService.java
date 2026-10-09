package com.mydashboard.costcolumn;

import static com.mydashboard.costcolumn.CostColumnDtos.*;

import com.mydashboard.account.ItemRepository;
import com.mydashboard.common.exception.BadRequestException;
import com.mydashboard.common.exception.NotFoundException;
import com.mydashboard.costestimate.CostEstimateRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Kolom kustom tabel Cost. Semua method menerima ownerId dan hanya menyentuh milik pengguna itu;
 * kolom atau baris milik orang lain dijawab "tidak ditemukan" (404).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CostColumnService {

    private static final int MAX_COLUMNS = 20;
    private static final int MAX_TEXT = 500;
    private static final BigDecimal MAX_NUMBER = new BigDecimal("1000000000000");

    private final CostColumnRepository columns;
    private final CostCellValueRepository cells;
    private final ItemRepository items;
    private final CostEstimateRepository estimates;

    @Transactional(readOnly = true)
    public TableMeta meta(UUID ownerId) {
        List<CostColumn> mine = columns.findAllByOwnerIdOrderBySortOrderAscCreatedAtAsc(ownerId);
        List<CellValueResponse> values = mine.isEmpty()
                ? List.of()
                : cells.findAllByColumnIdIn(mine.stream().map(CostColumn::getId).toList()).stream().map(this::toCell).toList();
        return new TableMeta(mine.stream().map(this::toColumn).toList(), values);
    }

    public ColumnResponse create(UUID ownerId, ColumnRequest req) {
        long count = columns.countByOwnerId(ownerId);
        if (count >= MAX_COLUMNS) throw new BadRequestException("Maksimal " + MAX_COLUMNS + " kolom.");
        CostColumn c = new CostColumn();
        c.setOwnerId(ownerId);
        c.setName(req.name().trim());
        c.setType(req.type().name());
        c.setOptions(joinOptions(req.type(), req.options()));
        c.setSortOrder((int) count);
        return toColumn(columns.save(c));
    }

    public ColumnResponse update(UUID ownerId, UUID id, ColumnUpdateRequest req) {
        CostColumn c = findColumn(ownerId, id);
        c.setName(req.name().trim());
        c.setOptions(joinOptions(ColumnType.valueOf(c.getType()), req.options()));
        return toColumn(c);
    }

    /** Nilai sel di kolom ini ikut terhapus oleh batasan foreign key (on delete cascade). */
    public void delete(UUID ownerId, UUID id) {
        columns.delete(findColumn(ownerId, id));
    }

    public void reorder(UUID ownerId, OrderRequest req) {
        List<CostColumn> mine = columns.findAllByOwnerIdOrderBySortOrderAscCreatedAtAsc(ownerId);
        Map<UUID, CostColumn> byId = new HashMap<>();
        for (CostColumn c : mine) byId.put(c.getId(), c);
        Set<UUID> requested = new HashSet<>(req.ids());
        if (req.ids().size() != byId.size() || !requested.equals(byId.keySet())) {
            throw new BadRequestException("Urutan kolom tidak valid.");
        }
        for (int i = 0; i < req.ids().size(); i++) byId.get(req.ids().get(i)).setSortOrder(i);
    }

    /** Mengisi atau mengosongkan satu sel. Nilai divalidasi sesuai jenis kolom lalu disimpan dalam bentuk baku. */
    public CellValueResponse setCell(UUID ownerId, UUID columnId, CellRequest req) {
        CostColumn column = findColumn(ownerId, columnId);
        requireRow(ownerId, req.rowType(), req.rowId());

        String canonical = canonical(column, req.value());
        CostCellValue existing = cells
                .findByColumnIdAndRowTypeAndRowId(columnId, req.rowType().name(), req.rowId())
                .orElse(null);

        if (canonical == null) {
            if (existing != null) cells.delete(existing);
            return new CellValueResponse(columnId, req.rowType(), req.rowId(), null);
        }
        CostCellValue cell = existing != null ? existing : new CostCellValue();
        if (existing == null) {
            cell.setColumnId(columnId);
            cell.setRowType(req.rowType().name());
            cell.setRowId(req.rowId());
        }
        cell.setValue(canonical);
        return toCell(cells.save(cell));
    }

    private String canonical(CostColumn column, Object raw) {
        if (raw == null) return null;
        ColumnType type = ColumnType.valueOf(column.getType());

        if (type == ColumnType.CHECKBOX) {
            boolean checked = raw instanceof Boolean b ? b : Boolean.parseBoolean(raw.toString());
            return checked ? "true" : null;
        }

        String text = raw.toString().trim();
        if (text.isEmpty()) return null;

        if (type == ColumnType.TEXT) {
            if (text.length() > MAX_TEXT) throw new BadRequestException("Teks maksimal " + MAX_TEXT + " karakter.");
            return text;
        }
        if (type == ColumnType.NUMBER || type == ColumnType.CURRENCY) {
            BigDecimal number;
            try {
                number = new BigDecimal(text);
            } catch (NumberFormatException e) {
                throw new BadRequestException("Nilai harus berupa angka.");
            }
            if (number.abs().compareTo(MAX_NUMBER) >= 0) throw new BadRequestException("Angka terlalu besar.");
            return number.stripTrailingZeros().toPlainString();
        }
        if (type == ColumnType.DATE) {
            try {
                return LocalDate.parse(text).toString();
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Tanggal tidak valid.");
            }
        }
        // SELECT: hanya pilihan yang didefinisikan pada kolom
        if (!optionsOf(column).contains(text)) throw new BadRequestException("Pilihan tidak tersedia pada kolom ini.");
        return text;
    }

    private String joinOptions(ColumnType type, List<String> raw) {
        if (type != ColumnType.SELECT) return null;
        List<String> clean = new ArrayList<>();
        if (raw != null) {
            for (String option : raw) {
                if (option == null) continue;
                String trimmed = option.replace("\n", " ").trim();
                if (trimmed.isEmpty()) continue;
                boolean duplicate = clean.stream().anyMatch(existing -> existing.equalsIgnoreCase(trimmed));
                if (!duplicate) clean.add(trimmed);
            }
        }
        if (clean.isEmpty()) throw new BadRequestException("Kolom pilihan butuh minimal satu opsi.");
        return String.join("\n", clean);
    }

    private List<String> optionsOf(CostColumn column) {
        String stored = column.getOptions();
        return stored == null || stored.isEmpty() ? List.of() : Arrays.asList(stored.split("\n"));
    }

    private void requireRow(UUID ownerId, RowType type, UUID rowId) {
        boolean exists = type == RowType.ITEM
                ? items.findOwned(rowId, ownerId).isPresent()
                : estimates.findByIdAndOwnerId(rowId, ownerId).isPresent();
        if (!exists) throw new NotFoundException("Baris tidak ditemukan.");
    }

    private CostColumn findColumn(UUID ownerId, UUID id) {
        return columns.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new NotFoundException("Kolom tidak ditemukan."));
    }

    private ColumnResponse toColumn(CostColumn c) {
        return new ColumnResponse(c.getId(), c.getName(), ColumnType.valueOf(c.getType()), optionsOf(c), c.getSortOrder());
    }

    private CellValueResponse toCell(CostCellValue v) {
        return new CellValueResponse(v.getColumnId(), RowType.valueOf(v.getRowType()), v.getRowId(), v.getValue());
    }
}
