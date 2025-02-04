<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 8, unique: true)]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private string $id;

    #[ORM\Column(type: "string", length: 12, unique: true)]
    private string $username;

    #[ORM\Column(type: 'string', length: 50, unique: true)]
    private string $email;

    #[ORM\Column(length: 255)]
    private string $password;

    #[ORM\Column(type: 'json', nullable: false, options: ['default' => '["ROLE_USER"]'])] 
    private array $roles = ["ROLE_USER"];

    #[ORM\Column(type: 'datetime')]
    private $createdAt;

    #[ORM\Column(type: 'datetime')]
    private $updatedAt;

    #[ORM\ManyToMany(targetEntity: Room::class, mappedBy: 'users')]
    private Collection $rooms;

    public function __construct()
    {
        $this->id = Uuid::uuid4()->toString();
        $this->rooms = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }
    public function getRoles(): array
    {
        $roles = $this->roles;

        if (!in_array('ROLE_USER', $roles, true)) {
            $roles[] = 'ROLE_USER';
        }

        return $roles;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function eraseCredentials(): void
    {
        //
    }

    public function getUserIdentifier(): string
    {
        return $this->username;
    }
    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }
    public function setId(string $id): self
    {
        $this->id = $id;
        return $this;
    }
    public function setUpdatedAt(): void
    {
        $this->updatedAt = new \DateTime(); 
    }
    public function generateId(EntityManagerInterface $entityManager): void
    {
        do {
            $shortUuid = substr(uniqid(), 0, 8);
            $existingUser = $entityManager->getRepository(self::class)
                ->findOneBy(['id' => $shortUuid]);
        } while ($existingUser !== null); 

        $this->id = $shortUuid; 
    }
    public function getRooms(): Collection
    {
        return $this->rooms;
    }
    
    public function addRoom(Room $room): self
    {
        if (!$this->rooms->contains($room)) {
            $this->rooms->add($room);
            $room->addUser($this);
        }
    
        return $this;
    }
    
    public function removeRoom(Room $room): self
    {
        if ($this->rooms->removeElement($room)) {
            $room->removeUser($this);
        }
    
        return $this;
    }
}
