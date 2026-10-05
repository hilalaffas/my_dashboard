package com.mydashboard.auth;

import com.mydashboard.common.exception.MailDeliveryException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    /** Kosong bila SMTP belum diatur (spring.mail.host tidak diisi). */
    private final ObjectProvider<JavaMailSender> senderProvider;

    @Value("${app.mail.from:no-reply@localhost}")
    private String from;

    @Value("${app.auth.dev-log-codes:false}")
    private boolean devLogCodes;

    public void sendVerificationCode(String to, String code) {
        JavaMailSender sender = senderProvider.getIfAvailable();
        if (sender == null) {
            if (devLogCodes) {
                log.warn("[DEV] Kode verifikasi untuk {}: {}", to, code);
                return;
            }
            throw new MailDeliveryException("Pengiriman email belum dikonfigurasi di server.");
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("Kode verifikasi Costly");
            message.setText("Kode verifikasi Anda: " + code
                    + "\n\nKode berlaku 10 menit. Abaikan email ini jika Anda tidak merasa mendaftar.");
            sender.send(message);
        } catch (MailException e) {
            log.error("Gagal mengirim email verifikasi ke {}", to, e);
            throw new MailDeliveryException("Gagal mengirim email verifikasi. Coba lagi nanti.");
        }
    }
}
