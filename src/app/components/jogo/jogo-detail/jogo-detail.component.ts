
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Game } from '../../../models/tip.model';
import { GameService } from '../../../services/tip.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Jogador } from '../../../models/jogador.model';
import { JogadorService } from '../../../services/jogador.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-jogo-detail',
    templateUrl: './jogo-detail.component.html',
    styleUrls: ['./jogo-detail.component.scss']
})
export class JogoDetailComponent implements OnInit, OnDestroy {
    id: string = '';
    game: Game = new Game();
    jogadores: Jogador[] = [];
    rowIndex?: number;
    jogador: Jogador = new Jogador();
    dialogJogador: boolean = false;
    private _unsubscribe: Subscription[] = [];

    constructor(
        private readonly _activatedRoute: ActivatedRoute,
        private readonly _gameService: GameService,
        private readonly _jogadorService: JogadorService,

    ) {
    }

    ngOnInit(): void {
        this.id = this._activatedRoute.snapshot.paramMap.get('id') as string;
        if (this.id) {
            this.loadGame();
        }
    }

    ngOnDestroy() {
        this._unsubscribe.forEach((sb) => sb.unsubscribe());
    }

    loadGame() {
        let sub = this._gameService.getById(this.id).subscribe(r => {
            this.game = r as Game;
            this.buscarJogadores();
        })
        this._unsubscribe.push(sub);
    }

    private calculatePercentage() {
        const valor: number = this.game.value;
        const valorTotalApostado = this.jogadores.reduce((total, jogador) => total + jogador.value, 0);


        this.jogadores.forEach(jogador => {
            jogador.percent = (jogador.value / valorTotalApostado) * 100;
            jogador.valorEsperado = (jogador.percent / 100) * valor;
        });
    }

    openDialogNewJogador(jogador?: Jogador) {
        this.jogador = new Jogador();
        if (jogador) this.jogador = jogador;
        this.dialogJogador = true;
    }

    saveJogador() {
        if (!this.jogador.name || !this.jogador.value) {
            return
        }
        this.jogador.gameId = this.id;
        this.jogador.modifiedOn = new Date();
        if (this.jogador.id) {
            this._jogadorService.update(this.jogador).then(r => {
                this.dialogJogador = false;
                this.buscarJogadores();
            }, err => {

            })
        } else {
            this.jogador.createdOn = new Date();
            this._jogadorService.add(this.jogador).then(r => {
                this.dialogJogador = false;
                this.buscarJogadores();
            }, err => {

            })
        }

    }

    delteJogador() {
        let id = this.jogador.id as string;
        this._jogadorService.delete(id).then(r => {
            this.dialogJogador = false;
            this.buscarJogadores();
        }, err => {

        })
    }

    buscarJogadores() {
        let sub = this._jogadorService.getByGameId(this.id).subscribe(rr => {
            this.jogadores = rr;
            this.calculatePercentage();
        })
        this._unsubscribe.push(sub);
    }

}
