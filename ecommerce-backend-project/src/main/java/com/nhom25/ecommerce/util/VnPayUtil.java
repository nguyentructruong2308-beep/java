package com.nhom25.ecommerce.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

public class VnPayUtil {

    /**
     * Chữ ký HMAC-SHA512 (Viết HOA Hex).
     */
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);

            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);

            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02X", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC-SHA512", e);
        }
    }

    /**
     * VNPAY 2.1.0: Cần encode GIÁ TRỊ tham số (RFC 3986) TRƯỚC khi băm.
     */
    public static String buildQueryString(Map<String, String> params) {
        Map<String, String> sortedParams = new TreeMap<>(params);
        StringJoiner sj = new StringJoiner("&");
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String value = entry.getValue();
            if (value != null && !value.isEmpty()) {
                try {
                    // Encode chuẩn RFC 3986 (dấu cách là %20)
                    String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
                            .replace("+", "%20");
                    sj.add(entry.getKey() + "=" + encodedValue);
                } catch (Exception e) {
                    sj.add(entry.getKey() + "=" + value);
                }
            }
        }
        return sj.toString();
    }

    public static boolean verifySignature(Map<String, String> params, String secretKey) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isEmpty()) {
            return false;
        }

        Map<String, String> vnp_Params = new TreeMap<>(params);
        vnp_Params.remove("vnp_SecureHash");
        vnp_Params.remove("vnp_SecureHashType");

        String dataToHash = buildQueryString(vnp_Params);
        String generatedHash = hmacSHA512(secretKey, dataToHash);

        return generatedHash.equalsIgnoreCase(receivedHash);
    }
}
