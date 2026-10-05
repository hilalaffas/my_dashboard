package com.mydashboard.auth;

import com.mydashboard.user.Role;
import java.util.UUID;

/** Identitas pengguna yang sedang login (diambil dari JWT). */
public record AuthUser(UUID id, String username, Role role) {}
