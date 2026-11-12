
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatUserController;

// INSCRIPTION
Route::post('/Chat_user', [ChatUserController::class, 'store']);

// CONNEXION
Route::post('/connection', [ChatUserController::class, 'connection']);

// ROUTES PROTEGEES
Route::middleware('auth:sanctum')->group(function () {

    // PROFIL
    Route::get('/profil', [ChatUserController::class, 'profil']);

    // LOGOUT
    Route::post('/logout', [ChatUserController::class, 'logout']);

});
Route::get('/holi',[ChatUserController::class,'index']);
