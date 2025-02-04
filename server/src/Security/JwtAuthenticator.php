<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\JsonResponse;

class JwtAuthenticator extends AbstractAuthenticator
{
    private JWTEncoderInterface $jwtEncoder;
    private UserProviderInterface $userProvider;

    public function __construct(JWTEncoderInterface $jwtEncoder, UserProviderInterface $userProvider)
    {
        $this->jwtEncoder = $jwtEncoder;
        $this->userProvider = $userProvider;
    }

    public function supports(Request $request): bool
    {
        return $request->cookies->has('authToken');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $request->cookies->get('authToken');

        if (!$token) {
            throw new AuthenticationException('No token provided');
        }

        $decodedToken = $this->jwtEncoder->decode($token);

        if (!$decodedToken || !isset($decodedToken['username'])) {
            throw new AuthenticationException('Invalid JWT token');
        }

        return new SelfValidatingPassport(new UserBadge($decodedToken['username'], function ($username) {
            return $this->userProvider->loadUserByIdentifier($username);
        }));
    }

    public function onAuthenticationSuccess(Request $request, $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return new JsonResponse(['error' => 'Authentication failed'], Response::HTTP_UNAUTHORIZED);
    }
}
