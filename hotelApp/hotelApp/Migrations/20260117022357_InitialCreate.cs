using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hotelApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Amenities",
                columns: table => new
                {
                    AmenityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IconClass = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Amenitie__842AF52B4749149B", x => x.AmenityId);
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    LocationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LocationName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ParentLocationID = table.Column<int>(type: "int", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsPopular = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Location__E7FEA477C269A20A", x => x.LocationID);
                });

            migrationBuilder.CreateTable(
                name: "Promotions",
                columns: table => new
                {
                    PromotionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    DiscountType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    MaxUsage = table.Column<int>(type: "int", nullable: true),
                    MinBookingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Promotio__52C42F2FA107A462", x => x.PromotionID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Customer"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__1788CCACE01E955D", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Hotels",
                columns: table => new
                {
                    HotelID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    LocationID = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StarRating = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    CheckInTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    CheckOutTime = table.Column<TimeOnly>(type: "time", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Active"),
                    MapLatitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    MapLongitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    MapUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Hotels__46023BBF95B73A61", x => x.HotelID);
                    table.ForeignKey(
                        name: "FK__Hotels__Location__3E52440B",
                        column: x => x.LocationID,
                        principalTable: "Locations",
                        principalColumn: "LocationID");
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    BookingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    HotelID = table.Column<int>(type: "int", nullable: false),
                    BookingDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    CheckInDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CheckOutDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Confirmed"),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Unpaid"),
                    SpecialRequest = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Bookings__73951ACD1A8CA07D", x => x.BookingID);
                    table.ForeignKey(
                        name: "FK__Bookings__HotelI__656C112C",
                        column: x => x.HotelID,
                        principalTable: "Hotels",
                        principalColumn: "HotelID");
                    table.ForeignKey(
                        name: "FK__Bookings__UserID__6477ECF3",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "HotelAmenities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HotelId = table.Column<int>(type: "int", nullable: false),
                    AmenityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HotelAmenities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HotelAmenities_Amenities_AmenityId",
                        column: x => x.AmenityId,
                        principalTable: "Amenities",
                        principalColumn: "AmenityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HotelAmenities_Hotels_HotelId",
                        column: x => x.HotelId,
                        principalTable: "Hotels",
                        principalColumn: "HotelID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HotelImages",
                columns: table => new
                {
                    ImageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HotelID = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsMain = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    Caption = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__HotelIma__7516F4ECA64EB59E", x => x.ImageID);
                    table.ForeignKey(
                        name: "FK__HotelImag__Hotel__47DBAE45",
                        column: x => x.HotelID,
                        principalTable: "Hotels",
                        principalColumn: "HotelID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomTypes",
                columns: table => new
                {
                    RoomTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HotelID = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxAdults = table.Column<int>(type: "int", nullable: true),
                    MaxChildren = table.Column<int>(type: "int", nullable: true),
                    RoomArea = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    BedType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomTypes", x => x.RoomTypeID);
                    table.ForeignKey(
                        name: "FK_RoomTypes_Hotels_HotelID",
                        column: x => x.HotelID,
                        principalTable: "Hotels",
                        principalColumn: "HotelID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    ReviewID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingID = table.Column<int>(type: "int", nullable: false),
                    HotelID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<decimal>(type: "decimal(3,1)", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    CleanlinessScore = table.Column<int>(type: "int", nullable: true),
                    ComfortScore = table.Column<int>(type: "int", nullable: true),
                    StaffScore = table.Column<int>(type: "int", nullable: true),
                    LocationScore = table.Column<int>(type: "int", nullable: true),
                    ValueScore = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Reviews__74BC79AE2ED53A73", x => x.ReviewID);
                    table.ForeignKey(
                        name: "FK__Reviews__Booking__6FE99F9F",
                        column: x => x.BookingID,
                        principalTable: "Bookings",
                        principalColumn: "BookingID");
                    table.ForeignKey(
                        name: "FK__Reviews__HotelID__70DDC3D8",
                        column: x => x.HotelID,
                        principalTable: "Hotels",
                        principalColumn: "HotelID");
                    table.ForeignKey(
                        name: "FK__Reviews__UserID__71D1E811",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "BookingDetails",
                columns: table => new
                {
                    DetailID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingID = table.Column<int>(type: "int", nullable: false),
                    RoomTypeID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    PricePerNight = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__BookingD__135C314D76F52AF9", x => x.DetailID);
                    table.ForeignKey(
                        name: "FK__BookingDe__Booki__693CA210",
                        column: x => x.BookingID,
                        principalTable: "Bookings",
                        principalColumn: "BookingID");
                    table.ForeignKey(
                        name: "FK__BookingDe__RoomT__6A30C649",
                        column: x => x.RoomTypeID,
                        principalTable: "RoomTypes",
                        principalColumn: "RoomTypeID");
                });

            migrationBuilder.CreateTable(
                name: "RoomAvailability",
                columns: table => new
                {
                    AvailabilityID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomTypeID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    AvailableQty = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsClosed = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__RoomAvai__DA397991655A09E3", x => x.AvailabilityID);
                    table.ForeignKey(
                        name: "FK__RoomAvail__RoomT__59063A47",
                        column: x => x.RoomTypeID,
                        principalTable: "RoomTypes",
                        principalColumn: "RoomTypeID");
                });

            migrationBuilder.CreateTable(
                name: "RoomTypeAmenities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomTypeId = table.Column<int>(type: "int", nullable: false),
                    AmenityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomTypeAmenities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoomTypeAmenities_Amenities_AmenityId",
                        column: x => x.AmenityId,
                        principalTable: "Amenities",
                        principalColumn: "AmenityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoomTypeAmenities_RoomTypes_RoomTypeId",
                        column: x => x.RoomTypeId,
                        principalTable: "RoomTypes",
                        principalColumn: "RoomTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomTypeImages",
                columns: table => new
                {
                    RoomImageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomTypeID = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__RoomType__989281C0334DEE01", x => x.RoomImageID);
                    table.ForeignKey(
                        name: "FK__RoomTypeI__RoomT__5070F446",
                        column: x => x.RoomTypeID,
                        principalTable: "RoomTypes",
                        principalColumn: "RoomTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingDetails_BookingID",
                table: "BookingDetails",
                column: "BookingID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingDetails_RoomTypeID",
                table: "BookingDetails",
                column: "RoomTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_HotelID",
                table: "Bookings",
                column: "HotelID");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserID",
                table: "Bookings",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "UQ__Bookings__C6E56BD52A8C04BA",
                table: "Bookings",
                column: "BookingCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HotelAmenities_AmenityId",
                table: "HotelAmenities",
                column: "AmenityId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelAmenities_HotelId",
                table: "HotelAmenities",
                column: "HotelId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelImages_HotelID",
                table: "HotelImages",
                column: "HotelID");

            migrationBuilder.CreateIndex(
                name: "IX_Hotels_LocationID",
                table: "Hotels",
                column: "LocationID");

            migrationBuilder.CreateIndex(
                name: "UQ__Hotels__BC7B5FB6323C7B18",
                table: "Hotels",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Promotio__A25C5AA7B9A8A6BB",
                table: "Promotions",
                column: "Code",
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_HotelID",
                table: "Reviews",
                column: "HotelID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserID",
                table: "Reviews",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "UQ__Reviews__73951ACCD228CF67",
                table: "Reviews",
                column: "BookingID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_RoomDate",
                table: "RoomAvailability",
                columns: new[] { "RoomTypeID", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoomTypeAmenities_AmenityId",
                table: "RoomTypeAmenities",
                column: "AmenityId");

            migrationBuilder.CreateIndex(
                name: "IX_RoomTypeAmenities_RoomTypeId",
                table: "RoomTypeAmenities",
                column: "RoomTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_RoomTypeImages_RoomTypeID",
                table: "RoomTypeImages",
                column: "RoomTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_RoomTypes_HotelID",
                table: "RoomTypes",
                column: "HotelID");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__A9D10534348EC600",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingDetails");

            migrationBuilder.DropTable(
                name: "HotelAmenities");

            migrationBuilder.DropTable(
                name: "HotelImages");

            migrationBuilder.DropTable(
                name: "Promotions");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "RoomAvailability");

            migrationBuilder.DropTable(
                name: "RoomTypeAmenities");

            migrationBuilder.DropTable(
                name: "RoomTypeImages");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Amenities");

            migrationBuilder.DropTable(
                name: "RoomTypes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Hotels");

            migrationBuilder.DropTable(
                name: "Locations");
        }
    }
}
