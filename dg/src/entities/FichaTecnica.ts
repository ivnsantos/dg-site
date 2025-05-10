import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("fichaTecnica")
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

    @ManyToOne("Product", "fichaTecnicas")
    @JoinColumn({ name: "productId" })
    product!: any

    @ManyToOne("Ingredient", "fichaTecnicas")
    @JoinColumn({ name: "ingredientId" })
    ingredient!: any

    @Column()
    productId!: number

    @Column()
    ingredientId!: number

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date
} 