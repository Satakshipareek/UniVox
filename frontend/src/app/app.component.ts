import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`
<div class="app-shell"><aside class="sidebar"><a routerLink="/" class="brand"><span class="brand-mark">✳</span><span>UniVox<small>YOUR CAMPUS, IN CONTROL</small></span></a>
<div class="nav-label">WORKSPACE</div><nav><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span>◫</span> Overview</a><a routerLink="/expenses" routerLinkActive="active"><span>↗</span> Expenses</a><a routerLink="/tasks" routerLinkActive="active"><span>✓</span> Tasks & reminders</a><a routerLink="/campus" routerLinkActive="active"><span>⌂</span> Campus info</a></nav>
<div class="sidebar-bottom"><a routerLink="/settings" routerLinkActive="active"><span>⚙</span> Settings</a><div class="profile"><div class="avatar">S</div><div><b>Student workspace</b><small>Personal assistant</small></div><span class="online-dot"></span></div></div></aside>
<main class="main-area"><header class="topbar"><div class="breadcrumb">Workspace <span>/</span> <b>UniVox</b></div><div class="top-right"><span class="live-pill"><i></i> AI assistant ready</span><div class="avatar small">S</div></div></header><section class="page-wrap"><router-outlet /></section></main></div>`})
export class AppComponent{}
