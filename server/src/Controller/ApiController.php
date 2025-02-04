<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Psr\Log\LoggerInterface;
use App\Entity\User;
use App\Entity\Room;
use App\Entity\Message;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class ApiController extends AbstractController
{
    private TokenStorageInterface $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    #[Route('/api/createRoom', name: 'create_room', methods: ['POST'])]
    public function createRoom(Request $request, EntityManagerInterface $entityManager) {
        $userAuth = $this->tokenStorage->getToken()?->getUser();

        if (!$userAuth || !($userAuth instanceof UserInterface)) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['title']) || empty($data['title'])) {
            return new JsonResponse(['error' => 'Title is required'], 400);
        }

        if (!isset($data['username']) || empty($data['username'])) {
            return new JsonResponse(['error' => 'Username is required'], 400);
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['username' => $data['username']]);
        $room = new Room();
        $room->setTitle($data['title']);
        $room->addUser($user);
        $entityManager->persist($room);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Room created successfully', 'roomId' => $room->getId()], 201);
    }
    #[Route('/api/room/{id}/messages', name: 'get_room_messages', methods: ['GET'])]
    public function getRoomMessages(Room $room): JsonResponse
    {
        return new JsonResponse($room->getMessagesArray());
    }

    #[Route('/api/createMessage', name: 'create_message', methods: ['POST'])]
    public function createMessage(Request $request, EntityManagerInterface $entityManager)
    {

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['content']) || empty($data['content'])) {
            return new JsonResponse(['error' => 'Content is required'], 400);
        }

        if (!isset($data['room']) || empty($data['room'])) {
            return new JsonResponse(['error' => 'Room ID is required'], 400);
        }
        $user = $entityManager->getRepository(User::class)->findOneBy(['username' => $data['sender']]);

        $room = $entityManager->getRepository(Room::class)->find($data['room']);
        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        $message = new Message();
        $message->setContent($data['content']);
        $message->setRoom($room);
        $message->setSender($user);

        $entityManager->persist($message);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Message stored successfully', 'messageId' => $message->getId()], 201);
    }
    #[Route('/api/getMessages', name: 'get_messages', methods: ['POST'])]
    public function getMessages(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['roomId']) || empty($data['roomId'])) {
            return new JsonResponse(['error' => 'Room ID is required'], 400);
        }

        $room = $entityManager->getRepository(Room::class)->find($data['roomId']);
        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        $messages = $entityManager->getRepository(Message::class)->findBy(
            ['room' => $room],
            ['createdAt' => 'ASC']
        );

        $formattedMessages = array_map(fn($msg) => [
            'id' => $msg->getId(),
            'content' => $msg->getContent(),
            'sender' => $msg->getSender()->getUsername(),
            'createdAt' => $msg->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $messages);

        return new JsonResponse($formattedMessages, 200);
    }

        
    
}
