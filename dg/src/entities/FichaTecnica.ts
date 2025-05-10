import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Product } from "./Product"
import { Ingredient } from "./Ingredient"

@Entity({ name: "fichaTecnica" })
export class FichaTecnica {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    description!: string

    @Column("decimal", { precision: 10, scale: 2 })
    unitCost!: number // Custo por unidade/grama do ingrediente

    @Column("decimal", { precision: 10, scale: 2 })
    quantityUsed!: number // Quantidade usada na receita

    @Column("decimal", { precision: 10, scale: 2 })
    totalCost!: number // Custo total deste ingrediente na receita (unitCost * quantityUsed)

    @Column()
    unit!: string // Unidade de medida (g, kg, ml, etc)

    @ManyToOne(() => Product, product => product.fichaTecnicas)
    @JoinColumn({ name: "productId" })
    product!: Product

    @ManyToOne(() => Ingredient, ingredient => ingredient.fichaTecnicas)
    @JoinColumn({ name: "ingredientId" })
    ingredient!: Ingredient

    @Column()
    productId!: number

    @Column()
    ingredientId!: number

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date
} 