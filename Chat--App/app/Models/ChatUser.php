<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class ChatUser extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'chat_users';

    protected $fillable = [
        'name',
        'prenom',
        'date_nais',
        'country',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];
}