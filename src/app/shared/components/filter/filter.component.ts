import { Router } from '@angular/router';
import { Activofijo } from '../../../models/activofijo';
import { IFilter } from './../../../interfaces/ifilter';
import { ConfigService } from './../../../services/config.service';
import { AssettypeService } from './../../../services/assettype.service';
import { Registry } from './../../../models/registry';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IActivofijo } from '../../../interfaces/iactivofijo';
import {IRegistry} from '../../../interfaces/iregistry';
import { filter, toNumber } from 'lodash-es';
import * as moment from 'moment'
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RegistryService } from '../../../services/registry.service';
import { IResponsable } from '../../../interfaces/iresponsable';
import { IMarca } from '../../../interfaces/imarca';
import { IEstado } from '../../../interfaces/iestado';
import { IAgencia } from '../../../interfaces/iagencia';
import { AngularFireAuth } from '@angular/fire/auth';
import { internalExists, quantityValid, invoiceExists, letterValid} from '../../../validators/validators';
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @Input() typeRegistry: string;
  @Input() showYears: boolean;
  @Input() showDateStartEnd: boolean;
  @Input() listOriginal: Registry[];
  public registrySelected: Registry;
  @Output() filter: EventEmitter<Registry[]>
  @Input() listRegistries: Registry[];
  public formRegistry: FormGroup;

public admin:any
public listaActivosfijos: IActivofijo[];
public listBranches: IAgencia[];
  public listEstados:IEstado[];
  public listMarcas:IMarca[];
  public listResponsables: IResponsable[];
  public cargarActivosfijos: boolean;
  public loadBranches:boolean;
  public loadEstados:boolean;
  public loadResponsables:boolean;
  public loadMarcas:boolean;
  public loadAssettypes: boolean;
  public filterForm: IFilter;
  public locale: any;
  public listAssettypes: IActivofijo[];
  public listFiltered: Registry[];
  public years: number[];
public filterReg:IRegistry;
public selectedAsset: IActivofijo = { id: 0, name: ''};
  public selectedBranch: IAgencia = { id: 0, name: ''};
  public selectedEstado: IEstado = { id: 0, name: '' };
  public selectedResponsable: IResponsable = { id: 0, name: '' };
  public selectedMarca: IMarca = { id: 0, name: '' };
  public oresponsables: IResponsable[];
  public atypes: IActivofijo[];
  public obranches: IAgencia[];
  public oestados: IEstado[];
  public omarcas: IMarca[];
public listRegistriesOriginal: IRegistry[];
  public listRegistriesFiltered: IRegistry[];
  public newUser:any;
  constructor(
    private formBuilder: FormBuilder,
    private aService: AssettypeService,
    private config: ConfigService,
    private route: Router,
    private rService: RegistryService,
    public authService: AuthService,
    private afAuth: AngularFireAuth,
  ) {
    this.listaActivosfijos = [];
    this.listFiltered = [];
    this.listBranches= [];
    this.listEstados=[];
    this.listResponsables=[];
    this.listMarcas=[];
    this.cargarActivosfijos = false;
    this.loadBranches = false;
    this.loadResponsables=false;
    this.loadEstados= false;
    this.loadMarcas=false;
    this.filter = new EventEmitter<Registry[]>();
    // Inicializo con valores iniciales
    this.filterForm = {
      'idActivofijo': null,
      'dateStart': null,
      'dateEnd': null,
      'year': toNumber(moment().format("YYYY")), // Año actual
      'priceMin': null,
      'priceMax': null,

    }
    this.filterReg={
      'id': null,     
      'idActivofijo': null,
      'activofijo': null,
      'type': null,
      'date': null,
      'precio':null,
      'catastralcode': null,
      'ruat': null,
      'serialnumber': null,
      'internalcode': null,
      'depreciation': null,
      'ubicacion': null,
      'responsable': null,
      'licenseplate':null,
      'typeofvehicle':null,
      'marca': null,
      'color': null,
     'cilindrada':null,
      'model': null,
     'user': null,
      'invoice':null,
      'proveedor':null,
      'fiscal':null,
      'authNumber':null,
      'agencia':null,
      'nombre':null,
      'imagePost':null,
      'qrcode': null,
      'estado':null,
      'hideCard':null,
      'descripcion':null,
      'carnetdeidentidad':null
    }
   this.admin= this.authService.admin;
   this.newUser=this.afAuth.auth.currentUser.email;
    
    this.locale = this.config.locale;
    this.years = [];
  }

  ngOnInit() {
    this.atypes = this.aService.getAtypes();
    this.omarcas=this.aService.getOmarcas();
    this.obranches=this.aService.getObranches();
    this.oestados=this.aService.getOestados();
    this.oresponsables=this.aService.getOresponsables();
    // Obtengo los activos
    if (this.registrySelected) {
      const d = new Date(this.registrySelected.date);
      d.setDate(d.getDate()+1);
    
      // Validamos la cantidad
      // Ponemos el id tambien para poder recogerlo despues
      this.formRegistry = this.formBuilder.group({
       
        date: new FormControl(new Date(d)),
        type: new FormControl(this.registrySelected.type),
        precio: new FormControl(this.registrySelected.precio),
        id: new FormControl(this.registrySelected.id),
        user: new FormControl(this.newUser),
        descripcion: new FormControl(this.registrySelected.descripcion),
        catastralcode: new FormControl(this.registrySelected.catastralcode),
        ruat: new FormControl(this.registrySelected.ruat),
        internalcode: new FormControl(this.registrySelected.internalcode),
        depreciation: new FormControl(this.registrySelected.depreciation),
        ubicacion: new FormControl(this.registrySelected.ubicacion),
        responsable: new FormControl(this.registrySelected.responsable),
        licenseplate: new FormControl(this.registrySelected.licenseplate),
        typeofvehicle: new FormControl(this.registrySelected.typeofvehicle),
        marca: new FormControl(this.registrySelected.marca),
        color: new FormControl(this.registrySelected.color),
        cilindrada: new FormControl(this.registrySelected.cilindrada),
        model: new FormControl(this.registrySelected.model),
        agencia:new FormControl(this.registrySelected.agencia),
        idActivofijo: new FormControl(this.registrySelected.idActivofijo),
        invoice: new FormControl(this.registrySelected.invoice),
        proveedor: new FormControl(this.registrySelected.proveedor),
        fiscal: new FormControl(this.registrySelected.fiscal),
        authNumber: new FormControl(this.registrySelected.authNumber),
        imagePost:new FormControl(this.registrySelected.imagePost),
        qrcode:new FormControl(this.registrySelected.qrcode),
        estado:new FormControl(this.registrySelected.estado), 
        carnetdeidentidad: new FormControl(this.registrySelected.carnetdeidentidad)     
      });
      
    } else {
      // Nuevo registro
      // Validamos la cantidad
     
      this.formRegistry = this.formBuilder.group({
       user: new FormControl(''),
        date: new FormControl(new Date()),      
        type: new FormControl(this.typeRegistry),
        id:new FormControl(0),
        descripcion: new FormControl(''),
        idActivofijo: new FormControl('',[Validators.required,letterValid]),
        agencia: new FormControl('',[Validators.required,letterValid]),
        estado: new FormControl('',[Validators.required,letterValid]),
        precio: new FormControl('', [Validators.required, quantityValid]),
        catastralcode: new FormControl(''),
        ruat: new FormControl(''),      
        internalcode: new FormControl('', [quantityValid, internalExists(this.listRegistries), Validators.maxLength(4)]),
        depreciation: new FormControl('', [Validators.required, quantityValid]),
        ubicacion: new FormControl(''),
        responsable: new FormControl('', [Validators.required,letterValid]),
        licenseplate: new FormControl(''),
        typeofvehicle: new FormControl(''),
        marca: new FormControl(''),
        color: new FormControl(''),
        cilindrada: new FormControl(''),
        model: new FormControl(''),
        invoice: new FormControl('', [Validators.required, quantityValid, Validators.maxLength(9),invoiceExists(this.listRegistries)]),
        proveedor: new FormControl('',[Validators.required,letterValid]),
        fiscal: new FormControl('',[Validators.required, quantityValid]),
        authNumber: new FormControl('', [Validators.required, quantityValid, Validators.maxLength(15)]),
        imagePost:new FormControl('', Validators.required),
        qrcode:new FormControl(''),
        carnetdeidentidad: new FormControl('')   
      });
    };
    this.aService.getActivofijo().subscribe(assettypes => {
      this.listAssettypes = assettypes;
    }, error => {
      console.error("Error al recuperar los activos fijos: " + error);
    })

    // Relleno los años
    if(this.showYears){
      this.fillYears();
    }
    

    
    
    // Obtengo los activos
    this.aService.getActivofijo().subscribe(listaActivosfijos => {
      this.listaActivosfijos= listaActivosfijos;

      this.cargarActivosfijos = true;
    }, error => {
      console.error(error);
      this.cargarActivosfijos= true;
    });
    this.aService.getBranches().subscribe(listBranches => {
      this.listBranches = listBranches;

      this.loadBranches = true;
    }, error => {
      console.error(error);
      this.loadBranches = true;
    });
    this.aService.getMarcas().subscribe(listMarcas => {
      this.listMarcas = listMarcas;

      this.loadMarcas = true;
    }, error => {
      console.error(error);
      this.loadMarcas = true;
    });
    this.aService.getResponsables().subscribe(listResponsables => {
      this.listResponsables = listResponsables;

      this.loadResponsables = true;
    }, error => {
      console.error(error);
      this.loadResponsables = true;
    });
  this.aService.getEstados().subscribe(listEstados => {
    this.listEstados = listEstados;

    this.loadEstados = true;
  }, error => {
    console.error(error);
    this.loadEstados = true;
  });
  }
 /**
   * Obtengo el formcontrol price
   */
  get precio() {
    return this.formRegistry.get('precio');

  }
  get catastralcode() {
    return this.formRegistry.get('catastralcode');

  }
/**
   * Obtengo el formcontrol internalcode
   */
  get internalcode() {
    return this.formRegistry.get('internalcode');
  }
  /**
   * Obtengo el formcontrol invoice
   */
  get invoice() {
    return this.formRegistry.get('invoice');
  }
  /**
   * Obtengo el formcontrol responsable
   */
  get responsable() {
    return this.formRegistry.get('responsable');
  }
/**
   * Obtengo el formcontrol depreciation
   */
  get depreciation() {
    return this.formRegistry.get('depreciation');
  }
  /**
   * Obtengo el formcontrol provider
   */
  get proveedor() {
    return this.formRegistry.get('proveedor');
  }
  /**
   * Obtengo el formcontrol type
   */
  get type() {
    return this.formRegistry.get('type');
  }
  
  /**
   * Obtengo el formcontrol idActivofijo
   */
  get idActivofijo() {
    return this.formRegistry.get('idActivofijo');
  }
  /**
   * Obtengo el formcontrol agencia
   */
  get agencia() {
    return this.formRegistry.get('agencia');
  }
  
  get estado() {
    return this.formRegistry.get('estado');
  }
  /**
   * Obtengo el formcontrol ubication
   */
  get ubicacion(){
    return this.formRegistry.get('ubicacion');
  }
/**
   * Obtengo el formcontrol date
   */
  get date(){
    return this.formRegistry.get('date');
  }
  /**
   * Obtengo el formcontrol fiscal
   */
  get fiscal(){
    return this.formRegistry.get('fiscal');
  }
  /**
   * Obtengo el formcontrol authNumber
   */
  get authNumber(){
    return this.formRegistry.get('authNumber');
  }
  
  get qrcode(){
    return this.formRegistry.get('qrcode');
  }
get imagePost(){
  return this.formRegistry.get('imagePost');
  
}
get user(){
  return this.formRegistry.get('user');
  
}
get descripcion(){
  return this.formRegistry.get('descripcion');
}
  /**
   * Relleno los años, obtengo el año inicial y el año final de la configuracion
   */
  fillYears(){
    for (let year = this.config.yearStart; year <= this.config.yearEnd; year++) {
      this.years.push(year);

    }
  }
  
    
  /**
   * Filtra los datos
   */
  filterData(){



    const maxPrice = this.filterForm.priceMax ? toNumber(this.filterForm.priceMax) : Number.MAX_SAFE_INTEGER;
    const minPrice = this.filterForm.priceMin ? toNumber(this.filterForm.priceMin): Number.MIN_SAFE_INTEGER;
    const dateStart = this.filterForm.dateStart ? this.filterForm.dateStart : new Date(-8640000000000000);
    const dateEnd = this.filterForm.dateEnd ? this.filterForm.dateEnd : new Date(8640000000000000);
    const year = this.filterForm.year ? this.filterForm.year : Date.now();
    const branches = this.filterReg.agencia ? this.filterReg.agencia :"";
    const asset = this.filterReg.idActivofijo ? this.filterReg.idActivofijo:"";
    const estados = this.filterReg.estado ? this.filterReg.estado:"";
    const responsables = this.filterReg.responsable ? this.filterReg.responsable:"";
    if (!this.showYears) {
      this.listFiltered = this.listOriginal.filter(l => {
        return moment(l.date, 'YYYY-MM-DD').isSameOrAfter(moment(dateStart, 'YYYY-MM-DD')) &&
          moment(l.date, 'YYYY-MM-DD').isSameOrBefore(moment(dateEnd, 'YYYY-MM-DD')) &&
          toNumber(l.precio) <= maxPrice &&
          toNumber(l.precio) >= minPrice &&
          (branches === "" ? true : branches ===  l.agencia) &&
          (asset === "" ? true : asset ===  l.idActivofijo) &&
          (estados=== "" ? true : estados ===  l.estado) &&
          (responsables=== "" ? true : responsables ===  l.responsable) &&
          this.route.navigate(['/resume'])

      })
    }
    else{
      this.listFiltered = this.listOriginal.filter(l => {
        return moment(l.date, 'YYYY-MM-DD').year() === moment(year, 'YYYY-MM-DD').year() &&
          toNumber(l.precio) <= maxPrice &&
          toNumber(l.precio) >= minPrice

      })

    }
    this.filter.emit(this.listFiltered);
  }
}
