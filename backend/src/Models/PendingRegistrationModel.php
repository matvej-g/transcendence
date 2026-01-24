<?php

namespace src\Models;

use src\Database;
use PDO;

class PendingRegistrationModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function savePendingRegistration($username, $displayname, $email, $passwordHash, $code, $expiresAt)
    {
        try {
            // Delete any existing pending registration for this email
            $this->db->query(
                "DELETE FROM pending_registrations WHERE email = ?",
                [$email]
            );

            // Insert new pending registration
            $this->db->query(
                "INSERT INTO pending_registrations (username, displayname, email, password_hash, verification_code, expires_at)
                VALUES (?, ?, ?, ?, ?, ?)",
                [$username, $displayname, $email, $passwordHash, $code, $expiresAt]
            );

            return true;
        } catch (\PDOException $e) {
            error_log("Error saving pending registration: " . $e->getMessage());
            return null;
        }
    }

    public function verifyAndCreateUser($email, $code, $bypass = false)
    {
        try {
            // Get pending registration
            $pending = $this->db->query(
                "SELECT * FROM pending_registrations WHERE email = ?",
                [$email]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$pending) {
                return ['success' => false, 'error' => 'No pending registration found'];
            }

            if (!$bypass) {
                // Check if code matches
                if ($pending['verification_code'] !== $code) {
                    return ['success' => false, 'error' => 'Invalid verification code'];
                }

                // Check if code has expired
                $now = date('Y-m-d H:i:s');
                if ($pending['expires_at'] < $now) {
                    // Delete expired registration
                    $this->db->query(
                        "DELETE FROM pending_registrations WHERE email = ?",
                        [$email]
                    );
                    return ['success' => false, 'error' => 'Verification code expired'];
                }
            }

            // Check if user already exists (edge case: duplicate registration)
            $existingUser = $this->db->query(
                "SELECT id FROM users WHERE email = ? OR username = ?",
                [$pending['email'], $pending['username']]
            )->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                // Delete pending registration since user already exists
                $this->db->query(
                    "DELETE FROM pending_registrations WHERE email = ?",
                    [$email]
                );
                return ['success' => false, 'error' => 'User with this email or username already exists'];
            }

            // Create the user
            $result = $this->db->query(
                "INSERT INTO users (username, displayname, email, password_hash)
                VALUES (?, ?, ?, ?)",
                [$pending['username'], $pending['displayname'], $pending['email'], $pending['password_hash']]
            );

            if (!$result) {
                return ['success' => false, 'error' => 'Failed to create user'];
            }

            $userId = $this->db->connection->lastInsertId();

            // Delete the pending registration
            $this->db->query(
                "DELETE FROM pending_registrations WHERE email = ?",
                [$email]
            );

            return ['success' => true, 'user_id' => $userId];
        } catch (\PDOException $e) {
            error_log("Error verifying registration: " . $e->getMessage());
            return ['success' => false, 'error' => 'Database error: ' . $e->getMessage()];
        }
    }

    public function deletePendingRegistration($email)
    {
        try {
            return $this->db->query(
                "DELETE FROM pending_registrations WHERE email = ?",
                [$email]
            );
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getPendingByEmail($email)
    {
        try {
            return $this->db->query(
                "SELECT * FROM pending_registrations WHERE email = ?",
                [$email]
            )->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error getting pending registration: " . $e->getMessage());
            return null;
        }
    }

    public function deletePending($email)
    {
        return $this->deletePendingRegistration($email);
    }

    public function updateCode($email, $code, $expiresAt)
    {
        try {
            $result = $this->db->query(
                "UPDATE pending_registrations SET verification_code = ?, expires_at = ? WHERE email = ?",
                [$code, $expiresAt, $email]
            );
            return $result !== null;
        } catch (\PDOException $e) {
            error_log("Error updating verification code: " . $e->getMessage());
            return null;
        }
    }
}
