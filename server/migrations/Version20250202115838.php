<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250202115838 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_rooms DROP CONSTRAINT FK_9E63E1CEA76ED395');
        $this->addSql('ALTER TABLE user_rooms DROP CONSTRAINT FK_9E63E1CE54177093');
        $this->addSql('ALTER TABLE user_rooms ADD CONSTRAINT FK_9E63E1CEA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_rooms ADD CONSTRAINT FK_9E63E1CE54177093 FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE user_rooms DROP CONSTRAINT fk_9e63e1ce54177093');
        $this->addSql('ALTER TABLE user_rooms DROP CONSTRAINT fk_9e63e1cea76ed395');
        $this->addSql('ALTER TABLE user_rooms ADD CONSTRAINT fk_9e63e1ce54177093 FOREIGN KEY (room_id) REFERENCES room (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_rooms ADD CONSTRAINT fk_9e63e1cea76ed395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
