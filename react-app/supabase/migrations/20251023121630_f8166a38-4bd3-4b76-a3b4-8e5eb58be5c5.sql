-- Truncate and repopulate with correct types
TRUNCATE TABLE achievements CASCADE;
TRUNCATE TABLE rewards CASCADE;

-- Populate achievements
INSERT INTO achievements (id, title, description, icon, xp, rarity, requirement_type, requirement_value) VALUES
('first_donation', 'First Steps', 'Make your first donation', '🌱', 10, 'common', 'total_donations', 1),
('ten_donations', 'Generous Giver', 'Make 10 donations', '🎁', 50, 'rare', 'total_donations', 10),
('twenty_five_donations', 'Dedicated Supporter', 'Make 25 donations', '💝', 100, 'rare', 'total_donations', 25),
('first_nft', 'NFT Novice', 'Collect your first NFT', '🎨', 20, 'common', 'total_nfts', 1),
('ten_nfts', 'NFT Enthusiast', 'Collect 10 NFTs', '🖼️', 100, 'rare', 'total_nfts', 10),
('level_5', 'Rising Star', 'Reach level 5', '⭐', 50, 'common', 'level', 5),
('level_10', 'Community Hero', 'Reach level 10', '🦸', 100, 'rare', 'level', 10);

-- Populate rewards with correct type values (achievement, badge, or reward)
INSERT INTO rewards (type, title, description, value, icon, rarity, requirement_level, requirement_xp) VALUES
('achievement', 'Beginner Badge NFT', 'Your first NFT badge', 'Beginner Badge NFT', '🌱', 'common', 1, 0),
('achievement', 'Bronze Warrior NFT', 'Bronze tier NFT', 'Bronze Eco Warrior NFT', '🥉', 'common', 3, 200),
('reward', '1 HBAR Bonus', 'Earn 1 HBAR', '1 HBAR', '💰', 'common', 2, 100),
('reward', '5 HBAR Bonus', 'Earn 5 HBAR', '5 HBAR', '💰', 'rare', 8, 700);