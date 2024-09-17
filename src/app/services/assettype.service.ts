import { AuthService } from '../../app/services/auth.service';
import { IActivofijo } from '../interfaces/iactivofijo';
import { Activofijo } from '../models/activofijo';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { IAgencia } from '../interfaces/iagencia';
import { IEstado } from '../interfaces/iestado';
import { IResponsable } from '../interfaces/iresponsable';
import { IMarca } from '../interfaces/imarca';
@Injectable({
  providedIn: 'root'
})
export class AssettypeService {
  public atypes: IActivofijo[]=[
    {
      id: 1,
      name: 'Terrenos',     
    },
    {
      id: 2,
      name: 'Edificaciones',      
    },
    {
      id: 3,
      name: 'Muebles y enseres',     
    },
    {
      id: 4,
      name: 'Maquinaria',    
    },
    {
      id: 5,
      name: 'Equipos e Instalaciones',     
    },
    {
    id:6,
    name: 'Vehículos',   
    },
    {
      id:7,
      name: 'Equipos de computación',    
    }
  ]
  public obranches: IAgencia[]=[
    {
      id: 1,
      name: 'Sucre',      
    },
    {
      id: 2,
      name: 'Padilla',    
    },
    {
      id: 3,
      name: 'Monteagudo',      
    },
    {
    id: 4,
      name: 'Potosí',   
    },
  ]
  public oestados: IEstado[]=[
    {
      id: 1,
      name: 'Alta',    
    },
    {
      id: 2,
      name: 'Baja',    
    },
  ]
  public oresponsables: IResponsable[]=[
    {
      id: 1,
      name: 'Juan Avila',    
    },
    {
      id: 2,
      name: 'Ronald Almendras',    
    },
    {
      id: 3,
      name: 'Richard Condori',    
    },
    {
      id: 4,
      name: 'Mario Sanchez Paco',    
    },
    {
      id: 5,
      name: 'Juan Choquehuanca',    
    },
    
  ]
  
  public omarcas: IMarca[]=[
    {
      id: 1,
      name: 'Toyota',    
    },
    {
      id: 2,
      name: 'Hyundai',    
    },
    {
      id: 3,
      name: 'Volvo',    
    },
    {
      id: 4,
      name: 'Mitsubishi',    
    },
    {
      id: 5,
      name: 'Volkswagen',    
    },
    {
      id: 6,
      name: 'Suzuki',    
    },
    {
      id: 7,
      name: 'Honda',    
    },
    {
      id: 8,
      name: 'Citroen',    
    },
    {
      id: 9,
      name: 'Ford',    
    },
    {
      id: 10,
      name: 'VMW',    
    },
    {
      id: 11,
      name: 'Nissan',    
    },
    {
      id: 12,
      name: 'Yamaha',    
    },
    {
      id: 13,
      name: 'Kawasaki',    
    },
    {
      id: 13,
      name: 'KIA',    
    },
  ]
  constructor(
    private afd: AngularFireDatabase,
    private authService: AuthService
  ) { }

  /**
   * Obtiene todas las categorias del usuario actual
   */

  getAtypes(): IActivofijo[]{
    return this.atypes;
  }
  getObranches():IAgencia[]{
    return this.obranches;
  }
  getOmarcas(): IMarca[]{
    return this.omarcas;
  }
  getActivofijo(): Observable<IActivofijo[]>{
    return this.afd.list<IActivofijo>('Activofijo', ref => ref.orderByChild('user').equalTo(this.authService.currentUser())).valueChanges();

  }
  getMarcas(): Observable<IMarca[]>{
    return this.afd.list<IMarca>('marca', ref => ref.orderByChild('user').equalTo(this.authService.currentUser())).valueChanges();

  }
  getBranches(): Observable<IAgencia[]>{
    return this.afd.list<IAgencia>('agencia', ref => ref.orderByChild('user').equalTo(this.authService.currentUser())).valueChanges();

  }
  getOestados():IEstado[]{
    return this.oestados;
  }
  getOresponsables():IResponsable[]{
    return this.oresponsables;
  }
  getResponsables(): Observable<IResponsable[]>{
    return this.afd.list<IResponsable>('responsable', ref => ref.orderByChild('user').equalTo(this.authService.currentUser())).valueChanges();

  }
  getEstados(): Observable<IEstado[]>{
    return this.afd.list<IEstado>('estado', ref => ref.orderByChild('user').equalTo(this.authService.currentUser())).valueChanges();

  }
  /**
   * Añade una categoria
   * @param assettype Categoria a añadir
   */
  addAssettype(assettype: Activofijo): Promise<boolean> {
    // Devolvemos una promesa
    return new Promise((resolve, reject) => {

      try {
        // Obtengo la referencia de los categorias
        let assettypeRef = this.afd.database.ref('assettypes');

        // añado una nueva categoria
        let newAssettype = assettypeRef.push();

        // Obtengo el id del nuevo registro
        assettype.id = newAssettype.key;

        // Añado elusuario logueado
        assettype.user = this.authService.currentUser()

        // Obtengo la referencia del registro mas su id
        let assettypeRefId = this.afd.database.ref('assettypes/' + assettype.id);

        // Seteo el valor
        assettypeRefId.set(assettype.getData());

        // Indico que todo se resolvio bien
        resolve(true);
      } catch (error) {
        // Hubo un error
        reject('Error al añadir un tipo de activo')
      }

    })

  }

  /**
   * Edita una categoria
   * @param activofijo Categoria a editar
   */
  editAssettype(activofijo: Activofijo): Promise<void> {
    return this.afd.object('/activofijos/' + activofijo.id).set(activofijo.getData());
  }

  /**
   * Elimina una categoria
   * @param idActivofijo id de la categoria a eliminar
   */
  removeAssettype(idActivofijo: string): Promise<void> {
    return this.afd.object('/activofijos/' + idActivofijo).remove();
  }


}
