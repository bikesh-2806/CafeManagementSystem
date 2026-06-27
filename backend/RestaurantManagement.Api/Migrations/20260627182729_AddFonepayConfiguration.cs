using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFonepayConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaymentGatewayConfigurations",
                columns: table => new
                {
                    PaymentGatewayConfigurationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    UseDemoMode = table.Column<bool>(type: "bit", nullable: false),
                    BaseUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MerchantCode = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProtectedMerchantSecret = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProtectedUsername = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProtectedPassword = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentGatewayConfigurations", x => x.PaymentGatewayConfigurationId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentGatewayConfigurations");
        }
    }
}
