<?php

namespace App\Http\Controllers;

use App\Models\ChatUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ChatUserController extends Controller
{
    // INSCRIPTION
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'date_nais' => 'required|date',
            'country' => 'required|string|max:255',
            'email' => 'required|email|unique:chat_users,email',
            'password' => 'required|string|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = ChatUser::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie',
            'user' => $user,
        ], 201);
    }

    // CONNEXION
    public function connection(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = ChatUser::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user,
        ], 200);
    }

    // PROFIL
    public function profil(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
        ], 200);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie',
        ], 200);
    }
    public function index()
{
    $users = ChatUser::all();

    return response()->json([
        'users' => $users
    ]);
}


}
