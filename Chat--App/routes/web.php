<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\chatusercontroller;

Route::post('/Chat_user', [chatusercontroller::class, 'store']);