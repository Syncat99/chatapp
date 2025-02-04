<?php

namespace App\Entity;

use App\Repository\RoomRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

#[ORM\Entity(repositoryClass: RoomRepository::class)]
class Room
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', unique: true)]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private string $id;

    #[ORM\Column(type: 'string')]
    private string $title;

    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'rooms')]
    #[ORM\JoinTable(name: 'user_rooms')]
    #[ORM\JoinColumn(name: 'room_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    #[ORM\InverseJoinColumn(name: 'user_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    private Collection $users;

    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'room', orphanRemoval: true, cascade: ["remove"])]
    private Collection $messages;

    public function __construct()
    {
        $this->id = substr(str_replace('-', '', Uuid::uuid4()->toString()), 0, 10);
        $this->users = new ArrayCollection();
        $this->messages = new ArrayCollection();
    }

    public function getId(): string 
    {
        return $this->id;
    }
    
    public function setId(string $id): self
    {
        $this->id = $id;
        return $this;
    }
    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }
    public function getTitle(): string
    {
        return $this->title;
    }

    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->addRoom($this);
        }
        return $this;
    }

    public function removeUser(User $user): self
    {
        if ($this->users->removeElement($user)) {
            $user->removeRoom($this);
        }
        return $this;
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): self
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setRoom($this);
        }
        return $this;
    }

    public function removeMessage(Message $message): self
    {
        if ($this->messages->removeElement($message)) {
            if ($message->getRoom() === $this) {
                $message->setRoom(null);
            }
        }
        return $this;
    }
    public function getMessagesArray(): array
    {
        return $this->messages->map(function ($message) {
            return [
                'id' => $message->getId(),
                'author' => $message->getSender()->getUsername(),
                'content' => $message->getContent(),
                'timestamp' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }
}
