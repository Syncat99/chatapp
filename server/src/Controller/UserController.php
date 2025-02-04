<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpFoundation\Cookie;
use App\Entity\User;
use App\Entity\Room;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;


final class UserController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private JWTTokenManagerInterface $jwtManager;

    public function __construct(
    EntityManagerInterface $entityManager,
    UserPasswordHasherInterface $passwordHasher,
    JWTTokenManagerInterface $jwtManager,
    TokenStorageInterface $tokenStorage
) {
    $this->entityManager = $entityManager;
    $this->passwordHasher = $passwordHasher;
    $this->tokenStorage = $tokenStorage;
    $this->jwtManager = $jwtManager;
}


    #[Route('/api/user', name: 'get_user', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getUserInfo(): JsonResponse
    {
        $user = $this->getUser();

        return new JsonResponse([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
        ]);
    }
    #[Route('/api/createUser', name: 'app_api', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {        
        $data = json_decode($request->getContent(), true);
        if (isset($data['data'])) {
            $data = $data['data'];
        }
        if (!isset($data['username'], $data['password'], $data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid data or email format'], 400);
        }
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $data['username']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Username already taken'], 409);
        }
        
        $user = new User();
        $user->generateId($this->entityManager);
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $roles = ['ROLE_USER'];

        if (isset($data['isAdmin']) && $data['isAdmin'] === true) {
            $roles[] = 'ROLE_ADMIN';
        }

        $user->setRoles($roles);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse(['status' => 'User created successfully'], 201);
    }

    #[Route('/api/login', name: 'app_login', methods: ['POST'])]
    public function login(Request $request, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (isset($data['data'])) {
            $data = $data['data'];
        }
        if (!isset($data['username'], $data['password'])) {
            return new JsonResponse(['error' => 'Invalid credentials'], 400);
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $data['username']]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return new JsonResponse(['error' => 'Invalid credentials'], 401);
        }

        $token = $this->jwtManager->create($user);

        $cookie = new Cookie(
            'authToken',
            $token,
            time() + 3600,
            '/',
            null,
            true,
            true,
            false,
            'None'
        );

        $response = new JsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles()
            ],
        ], 200);

        $response->headers->setCookie($cookie);

        return $response;
    }

    private function removeInvalidCookie(string $errorMessage): JsonResponse
    {
        $cookie = new Cookie(
            'authToken',                
            '',                        
            (new \DateTime('1970-01-01'))->getTimestamp(),
            '/',                       
            null,                      
            true,                      
            true,                       
            false,                     
            'Lax'                       
        );

        $response = new JsonResponse(['error' => $errorMessage], 401);
        $response->headers->setCookie($cookie);
        return $response;
    }

    #[Route('/api/checkAuth', name: 'get_user', methods: ['GET'])]
    public function validateToken(Request $request, JWTEncoderInterface $jwtEncoder): JsonResponse
    {
        $token = $request->cookies->get('authToken');

        if (!$token) {
            return $this->removeInvalidCookie('Unauthorized');
        }

        try {
            $decodedToken = $jwtEncoder->decode($token);
            $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $decodedToken['username']]);
            if (!$user) {
                return $this->removeInvalidCookie('User not found');
            }
        } catch (\Exception $e) {
            return $this->removeInvalidCookie('Invalid token');
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
    #[Route('/api/logout', name: 'app_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $cookie = new Cookie(
            'authToken',                    
            '',                             
            (new \DateTime('1970-01-01'))->getTimestamp(), 
            '/',
            null,                   
            false,                       
            true,                           
            false,                           
            'Lax'                           
        );

        $response = new JsonResponse(['status' => "logged out"], 201);
        $response->headers->setCookie($cookie);
        return $response;
    }
    #[Route('/api/getRooms', name: 'get_rooms', methods: ['GET'])]
    public function getRooms(): JsonResponse
    {
        try {
            $user = $this->tokenStorage->getToken()?->getUser();

            if (!$user || !($user instanceof UserInterface)) {
                return new JsonResponse(['error' => 'Unauthorized'], 401);
            }

            if (!method_exists($user, 'getRooms')) {
                return new JsonResponse(['error' => 'User entity is incorrect'], 500);
            }

            $rooms = $user->getRooms();

            if ($rooms->isEmpty()) {
                error_log("⚠️ User has no rooms.");
                return new JsonResponse(['message' => 'User has no rooms'], 200);
            }

            $roomsArray = $rooms->map(fn ($room) => [
                'id' => $room->getId(),
                'title' => $room->getTitle(),
            ])->toArray();

            return new JsonResponse($roomsArray);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Internal Server Error', 'details' => $e->getMessage()], 500);
        }
    }
    #[Route('/api/joinRoom', name: 'join_room', methods: ['POST'])]
    public function joinRoom(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['roomId'], $data['userId'])) {
            return new JsonResponse(['error' => 'Missing required parameters'], 400);
        }
        $room = $entityManager->getRepository(Room::class)->find($data['roomId']);
        $user = $entityManager->getRepository(User::class)->find($data['userId']);
        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }
        if ($room->getUsers()->contains($user)) {
            return new JsonResponse(['message' => 'User is already in the room'], 200);
        }
        $room->addUser($user);
        $entityManager->persist($room);
        $entityManager->flush();
        return new JsonResponse(['message' => 'User added to the room successfully'], 200);
    }
    #[Route('/api/quitRoom', name: 'quit_room', methods: ['POST'])]
    public function quitRoom(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['roomId'], $data['userId'])) {
            return new JsonResponse(['error' => 'Missing required parameters'], 400);
        }

        $room = $entityManager->getRepository(Room::class)->find($data['roomId']);
        $user = $entityManager->getRepository(User::class)->find($data['userId']);

        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($room->getUsers()->contains($user)) {
            $room->removeUser($user);
            $entityManager->persist($room);
            $entityManager->flush();
        }

        return new JsonResponse(['message' => 'User left the room successfully'], 200);
    }
    #[Route('/api/deleteRoom', name: 'delete_room', methods: ['POST'])]
    public function deleteRoom(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['roomId'])) {
            return new JsonResponse(['error' => 'Missing required roomId'], 400);
        }

        $room = $entityManager->getRepository(Room::class)->find($data['roomId']);

        if (!$room) {
            return new JsonResponse(['error' => 'Room not found'], 404);
        }

        $entityManager->remove($room);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Room deleted successfully'], 200);
    }
}
